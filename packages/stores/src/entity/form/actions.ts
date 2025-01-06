import i18next from "i18next";
import {uniqueId} from "lodash";
import {action, autorun, computed, makeObservable, observable, runInAction} from "mobx";
import {v4} from "uuid";

import {messageStore, requestStore, Router, RouterConfirmation} from "@focus4/core";

import {LoadRegistration, NodeLoadBuilder, toFlatValues} from "../store";
import {FormListNode, FormNode, isFormEntityField, isFormNode, isStoreNode, NodeToType} from "../types";

type FormActionsEvent = "cancel" | "edit" | "error" | "load" | "save";

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
export class FormActions<
    FN extends FormListNode | FormNode = any,
    A extends readonly any[] = any[]
> extends LoadRegistration<FN["sourceNode"], A> {
    /** Mode d'affichage des erreurs du formulaire. */
    errorDisplay: "after-focus" | "always" | "never";

    protected declare builder: FormActionsBuilder<FN, A>;

    private readonly formNode: FN;

    /**
     * Enregistre des actions de formulaire sur un noeud.
     * @param node Le noeud.
     * @param builder Builder pour les actions de forumaire.
     * @param trackingId Id de suivi de requête pour ce load.
     */
    constructor(formNode: FN, builder: FormActionsBuilder<FN, A>, trackingId = v4()) {
        super(formNode.sourceNode, builder, trackingId);
        this.formNode = formNode;

        this.errorDisplay = this.actionsErrorDisplay;

        makeObservable(this, {
            errorDisplay: observable,
            formProps: computed,
            onClickCancel: action.bound,
            onClickEdit: action.bound,
            panelProps: computed,
            save: action.bound
        });
    }

    /** Récupère les props à fournir à un Form pour lui fournir les actions. */
    get formProps(): ActionsFormProps {
        return {
            errorDisplay: this.errorDisplay,
            save: this.save
        };
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons aux actions. */
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
    private get actionsErrorDisplay() {
        return this.builder.actionsErrorDisplay ?? (this.formNode.form.isEdit ? "after-focus" : "always");
    }

    /**
     * Handler de clic sur le bouton "Annuler".
     *
     *
     * Repasse le formulaire en mode consultation, annule toutes les modification et lance les handlers `"cancel"`.
     */
    onClickCancel() {
        if (this.actionsErrorDisplay === "after-focus") {
            this.errorDisplay = "after-focus";
        }
        this.formNode.form.isEdit = false;
        this.formNode.reset();
        (this.builder.handlers.cancel || []).forEach(handler => handler("cancel"));
    }

    /**
     * Handler de clic sur le bouton "Modifier".
     *
     * Passe le formulaire en mode édition et lance les handlers `"edit"`.
     */
    onClickEdit() {
        if (this.actionsErrorDisplay === "after-focus") {
            this.errorDisplay = "after-focus";
        }
        this.formNode.form.isEdit = true;
        (this.builder.handlers.edit || []).forEach(handler => handler("edit"));
    }

    /** Appelle le service de sauvegarde avec le contenu du formulaire, si ce dernier est valide. */
    async save() {
        if (this.actionsErrorDisplay === "after-focus") {
            this.errorDisplay = "always";
        }

        // On ne fait rien si on est déjà en chargement.
        if (this.isLoading || !this.builder.saveService) {
            return;
        }

        try {
            // On ne sauvegarde que si la validation est en succès.
            if (this.formNode.form && !this.formNode.form.isValid) {
                // eslint-disable-next-line @typescript-eslint/only-throw-error
                throw {
                    $validationError: true,
                    detail: this.formNode.form.errors
                };
            }

            const data = await requestStore.track([this.trackingId, ...this.builder.trackingIds], () =>
                this.builder.saveService!(toFlatValues(this.formNode))
            );
            runInAction(() => {
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

                if (data) {
                    // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                    if (isStoreNode(this.formNode.sourceNode)) {
                        this.formNode.sourceNode.replace(data);
                    } else {
                        this.formNode.sourceNode.replaceNodes(data as any);
                    }
                }
            });

            if (this.builder.message) {
                messageStore.addSuccessMessage(i18next.t(this.builder.message));
            }

            // On ne force plus l'affichage des erreurs une fois la sauvegarde effectuée, puisqu'il n'y a plus.
            if (this.actionsErrorDisplay === "after-focus") {
                this.errorDisplay = "after-focus";
            }

            (this.builder.handlers.save || []).forEach(handler => handler("save"));
        } catch (e: unknown) {
            (this.builder.handlers.error || []).forEach(handler => handler("error"));
            throw e;
        }
    }

    override register(node?: FN["sourceNode"], builder?: NodeLoadBuilder<FN["sourceNode"], A>) {
        const loadDisposer = super.register(node, builder);

        if (this.builder.confirmation) {
            const confirmationId = uniqueId("FormActions_");
            const confirmationDisposer = autorun(() => {
                this.builder.confirmation!.toggle(confirmationId, this.formNode.form.isEdit, () => this.save());
            });
            return () => {
                loadDisposer();
                confirmationDisposer();
                this.builder.confirmation!.toggle(confirmationId, false);
            };
        }

        return loadDisposer;
    }
}

export class FormActionsBuilder<
    FN extends FormListNode | FormNode,
    A extends readonly any[] = never
> extends NodeLoadBuilder<FN["sourceNode"], A> {
    /** @internal */
    readonly handlers = {} as Record<FormActionsEvent, ((event: FormActionsEvent) => void)[]>;

    /** @internal */
    actionsErrorDisplay?: "after-focus" | "always" | "never";
    /** @internal */
    confirmation?: RouterConfirmation;
    /** @internal */
    message = "focus.detail.saved";
    /** @internal */
    saveService?: (entity: NodeToType<FN>) => Promise<NodeToType<FN> | void>;

    /**
     * Précise la getter permettant de récupérer la liste des paramètres pour l'action de chargement.
     * Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification.
     * @param get Getter.
     */
    params<const NA extends any[]>(get: () => NA | undefined): FormActionsBuilder<FN, NonNullable<NA>>;
    params<NA>(get: () => NA): FormActionsBuilder<FN, [NonNullable<NA>]>;
    /**
     * Précise des paramètres fixes (à l'initialisation) pour l'action de chargement.
     * @param params Paramètres.
     */
    params<const NA extends any[]>(...params: NA): FormActionsBuilder<FN, NonNullable<NA>>;
    params<const NA extends any[]>(...params: NA): FormActionsBuilder<FN, NonNullable<NA>> {
        return super.params(...params) as any;
    }

    /**
     * Enregistre le service de chargement.
     * @param service Service de chargement.
     */
    load(
        service: A extends never ? never : (...params: A) => Promise<NodeToType<FN> | undefined>
    ): FormActionsBuilder<FN, A> {
        return super.load(service) as any;
    }

    /**
     * Enregistre un service de sauvegarde.
     * @param service Service de sauvegarde.
     */
    save(service: (entity: NodeToType<FN>) => Promise<NodeToType<FN> | void>): FormActionsBuilder<FN, A> {
        this.saveService = service;
        return this;
    }

    /**
     * Enregistre un handler
     * @param event Nom de l'évènement.
     * @param handler Handler de l'évènement.
     */
    on<E extends FormActionsEvent>(event: E | E[], handler: (event: E) => void): FormActionsBuilder<FN, A> {
        return super.on(event as any, handler as any) as any;
    }

    /**
     * Attache un (ou plusieurs) ids de suivi de requêtes au service de chargement (en plus de l'id par défaut).
     *
     * Cela permettra d'ajouter l'état du service au `isLoading` de cet(ces) id(s).
     * @param trackingIds Id(s) de suivi.
     */
    trackingId(...trackingIds: string[]): FormActionsBuilder<FN, A> {
        return super.trackingId(...trackingIds) as any;
    }

    /**
     * Change le mode d'affichage des erreurs dans les champs du formulaire (via le composant `Form` et `formProps`).
     * Les modes possibles sont :
     *
     * - `"always"` : Les erreurs sont toujours affichées.
     * - `"after-focus"` : Chaque champ affiche son erreur après avoir été focus au moins une fois, ou bien après avoir appelé la sauvegarde du formulaire.
     * - `"never"` : Les erreurs ne sont jamais affichées.
     *
     * Par défaut, le mode est `"after-focus"` pour un formulaire initialement en édition, et `"always"` sinon.
     *
     * @param mode Mode d'affichage des erreurs.
     */
    errorDisplay(mode: "after-focus" | "always" | "never"): FormActionsBuilder<FN, A> {
        this.actionsErrorDisplay = mode;
        return this;
    }

    /**
     * Surcharge le message de succès à la sauvegarde du formulaire. Si le message est vide, aucun message ne sera affiché.
     * @param message Le message de succès.
     */
    successMessage(message: string): FormActionsBuilder<FN, A> {
        this.message = message;
        return this;
    }

    /**
     * Active le mode 'confirmation' du routeur lorsque le formulaire est en édition.
     * @param router Router.
     */
    withConfirmation(router: Router) {
        this.confirmation = router.confirmation;
        return this;
    }
}
