import {merge} from "es-toolkit";
import i18next from "i18next";
import {action, autorun, computed, observable} from "mobx";

import {messageStore, requestStore} from "@focus4/core";

import {LoadRegistration} from "../store";
import {FormListNode, FormNode, isFormEntityField, isFormNode, isStoreNode, SourceNodeType} from "../types";
import {toFlatValues} from "../utils";

import {FormActionsBuilder} from "./builders";

/** Props passées au composant de formulaire. */
export interface ActionsFormProps {
    /** Mode d'affichage des erreurs du formulaire. */
    errorDisplay: "after-focus" | "always" | "never";
    /** Appelle le service de sauvegarde. */
    save(): Promise<void>;
}

/** Props passées au composant de panel. */
export interface ActionsPanelProps {
    /** Formulaire en édition. */
    editing: boolean;
    /** Formulaire en chargement. */
    loading: boolean;
    /** Appelé au clic sur le bouton "Annuler". */
    onClickCancel(): void;
    /** Appelé au clic sur le bouton "Modifier". */
    onClickEdit(): void;
    /** Appelle le service de sauvegarde. */
    save(): Promise<void>;
}

/** Gère les actions d'un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
export class FormActions<A extends readonly any[] = never> extends LoadRegistration<A> {
    /** Mode d'affichage des erreurs du formulaire. */
    @observable accessor errorDisplay: "after-focus" | "always" | "never";

    // @ts-ignore
    declare protected builder: FormActionsBuilder<FormListNode | FormNode, A, any, any, any>;

    private readonly formNode: FormListNode | FormNode;

    /**
     * Enregistre des actions de formulaire sur un noeud.
     * @param node Le noeud.
     * @param builder Builder pour les actions de forumaire.
     * @param trackingId Id de suivi de requête pour ce load.
     */
    constructor(
        formNode: FormListNode | FormNode,
        builder: FormActionsBuilder<FormListNode | FormNode, A, any, any, any>,
        trackingId: string = Math.random().toString()
    ) {
        super(formNode.sourceNode, builder, trackingId);
        this.formNode = formNode;
        this.errorDisplay = this.actionsErrorDisplay;
    }

    /** Récupère les props à fournir à un Form pour lui fournir les actions. */
    @computed
    get formProps(): ActionsFormProps {
        return {
            errorDisplay: this.errorDisplay,
            save: this.save
        };
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons aux actions. */
    @computed
    get panelProps(): ActionsPanelProps {
        return {
            editing: this.formNode.form.isEdit,
            loading: this.isLoading,
            onClickCancel: this.onClickCancel,
            onClickEdit: this.onClickEdit,
            save: this.save
        };
    }

    /** Mode d'affichage des erreurs choisi dans la configuration. */
    @computed
    private get actionsErrorDisplay() {
        return this.builder.actionsErrorDisplay ?? (this.formNode.form.isEdit ? "after-focus" : "always");
    }

    /**
     * Handler de clic sur le bouton "Annuler".
     *
     * Repasse le formulaire en mode consultation, annule toutes les modification et lance les handlers `"cancel"`.
     */
    @action.bound
    onClickCancel() {
        if (this.actionsErrorDisplay === "after-focus") {
            this.errorDisplay = "after-focus";
        }
        this.formNode.form.isEdit = false;
        this.formNode.reset();

        for (const handler of this.builder.handlers.cancel ?? []) {
            handler("cancel");
        }
    }

    /**
     * Handler de clic sur le bouton "Modifier".
     *
     * Passe le formulaire en mode édition et lance les handlers `"edit"`.
     */
    @action.bound
    onClickEdit() {
        if (this.actionsErrorDisplay === "after-focus") {
            this.errorDisplay = "after-focus";
        }
        this.formNode.form.isEdit = true;

        for (const handler of this.builder.handlers.edit ?? []) {
            handler("edit");
        }
    }

    /** Appelle le service de sauvegarde avec le contenu du formulaire, si ce dernier est valide. */
    @action.bound
    async save() {
        if (this.actionsErrorDisplay === "after-focus") {
            this.errorDisplay = "always";
        }

        const service = this.builder.saveService
            ? "save"
            : this.builder.updateService && this.params
              ? "update"
              : this.builder.createService && !this.params
                ? "create"
                : undefined;

        // On ne fait rien si on est déjà en chargement et qu'on a pas le bon service disponible à appeler.
        if (this.isLoading || !service) {
            return;
        }

        try {
            // On ne sauvegarde que si la validation est en succès.
            if (this.formNode.form && !this.formNode.form.isValid) {
                // oxlint-disable-next-line no-throw-literal
                throw {
                    $validationError: true,
                    detail: this.formNode.form.errors
                };
            }

            const data = await requestStore.track<object>(
                [this.trackingId, ...this.builder.trackingIds],
                () => {
                    const d = toFlatValues(this.formNode);
                    if (this.builder.saveService) {
                        return this.builder.saveService(d);
                    } else if (this.params && this.builder.updateService) {
                        return this.builder.updateService(...this.params, d);
                    } else {
                        return this.builder.createService!(d);
                    }
                },
                response => {
                    this.formNode.form.isEdit = false;

                    // On met à jour le _initialData avec les valeurs qu'on avait à la sauvegarde.
                    function updateInitialData(source: unknown, target: unknown) {
                        if (isFormNode(source) && target && typeof target === "object") {
                            for (const key in source) {
                                const item: any = source[key];
                                if (key in target) {
                                    if (isFormEntityField(item)) {
                                        (target as any)[key] = item.value;
                                    } else if (isFormNode(item)) {
                                        updateInitialData(item, (target as any)[key]);
                                    }
                                }
                            }
                        }
                    }
                    updateInitialData(this.formNode, this.formNode.form._initialData);

                    if (response && typeof response === "object" && !(response instanceof Response)) {
                        // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                        if (isStoreNode(this.formNode.sourceNode)) {
                            this.formNode.sourceNode.replace(response);
                        } else {
                            this.formNode.sourceNode.replaceNodes(response as any);
                        }
                        // Si on a pas de retour du serveur, on sauvegarde à la place les données du formulaire dans le noeud de store.
                    } else if (isFormNode(this.formNode)) {
                        this.formNode.sourceNode.replace(this.formNode);
                    } else {
                        this.formNode.sourceNode.replaceNodes(this.formNode);
                    }
                }
            );

            if (this.builder.message) {
                messageStore.addSuccessMessage(i18next.t(this.builder.message));
            }

            // On ne force plus l'affichage des erreurs une fois la sauvegarde effectuée, puisqu'il n'y a plus.
            if (this.actionsErrorDisplay === "after-focus") {
                this.errorDisplay = "after-focus";
            }

            for (const handler of this.builder.handlers[service] ?? []) {
                handler(service as never, data as any);
            }
        } catch (error) {
            for (const handler of this.builder.handlers.error ?? []) {
                handler("error", service, error);
            }

            throw error;
        }
    }

    /** Vide le noeud de formulaire et ainsi son noeud source. */
    override clear() {
        super.clear();
        this.formNode.clear();
    }

    override register(
        node?: (FormListNode | FormNode)["sourceNode"],
        builder?: FormActionsBuilder<FormListNode | FormNode, A, any, any, any>
    ) {
        const loadDisposer = super.register(node, builder);

        if (this.builder.confirmation) {
            const confirmationId = Math.random().toString();
            const confirmationDisposer = autorun(() => {
                this.builder.confirmation!.toggle(
                    confirmationId,
                    this.formNode.form.isEdit && this.formNode.form.hasChanged,
                    () => this.save()
                );
            });
            return () => {
                loadDisposer();
                this.abortController?.abort();
                confirmationDisposer();
                this.builder.confirmation!.toggle(confirmationId, false);
            };
        }

        return loadDisposer;
    }

    /** Appelle le service d'initilisation enregistré sur le `FormActions`, si aucun `load` ne peut être appelé. */
    @action.bound
    async init() {
        if (this.builder.hasInit && (!this.params || !this.builder.loadService)) {
            try {
                const initData = this.builder.initService
                    ? await requestStore.track([this.trackingId, ...this.builder.trackingIds], () =>
                          this.builder.initService!()
                      )
                    : ({} as SourceNodeType<FormListNode | FormNode>);

                this.formNode.form._initialData = merge(this.formNode.form._initialData ?? {}, initData);

                if (isFormNode(this.formNode)) {
                    this.formNode.sourceNode.replace(this.formNode.form._initialData!);
                } else {
                    this.formNode.sourceNode.replaceNodes(this.formNode.form._initialData!);
                }

                for (const handler of this.builder.handlers.init ?? []) {
                    handler("init", initData);
                }
            } catch (error) {
                this.clear();

                for (const handler of this.builder.handlers.error ?? []) {
                    handler("error", "init", error);
                }

                throw error;
            }
        }
    }
}
