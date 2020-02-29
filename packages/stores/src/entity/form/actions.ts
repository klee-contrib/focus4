import {messageStore} from "@focus4/core";
import i18next from "i18next";
import {isFunction} from "lodash";
import {action, comparer, computed, extendObservable, Lambda, observable, reaction, runInAction} from "mobx";

import {toFlatValues} from "../store";
import {FormListNode, FormNode, isStoreNode, NodeToType} from "../types";

type FormActionsEvent = "cancel" | "edit" | "error" | "load" | "save";

/** Props passées au composant de formulaire. */
export interface ActionsFormProps {
    /** Pour forcer l'affichage des erreurs aux Fields enfants. */
    forceErrorDisplay: boolean;
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
export type FormActions<S extends string = "default"> = ActionsFormProps & {
    /** Dispose la réaction de chargement. */
    dispose?: Lambda;
    /** Formulaire en chargement. */
    isLoading: boolean;
    /** Récupère les props à fournir à un Form pour lui fournir les actions. */
    readonly formProps: ActionsFormProps;
    /** Récupère les props à fournir à un Panel pour relier ses boutons aux actions. */
    readonly panelProps: ActionsPanelProps;
    /** Appelle le service de chargement (appelé par la réaction de chargement). */
    load(): Promise<void>;
    /** Handler de clic sur le bouton "Annuler". */
    onClickCancel(): void;
    /** Handler de clic sur le bouton "Modifier". */
    onClickEdit(): void;
} & {[P in Exclude<S, "default">]: () => Promise<void>};

export class FormActionsBuilder<
    FN extends FormNode | FormListNode,
    A extends ReadonlyArray<any> = never,
    S extends string = never
> {
    protected getLoadParams?: () => any | undefined;
    protected loadService?: (...args: A) => Promise<NodeToType<FN> | undefined>;
    protected readonly saveServices = {} as Record<S, (entity: NodeToType<FN>) => Promise<NodeToType<FN> | void>>;

    protected readonly formNode: FN;
    protected readonly handlers = {} as Record<FormActionsEvent, ((event: any, saveName?: S) => void)[]>;
    protected prefix = "focus";
    protected saveNamesForMessages = false;

    constructor(formNode: FN) {
        this.formNode = formNode;
    }

    /**
     * Précise la getter permettant de récupérer la liste des paramètres pour l'action de chargement.
     * Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification.
     * @param get Getter.
     */
    params<NA extends ReadonlyArray<any>>(get: () => NA | undefined): FormActionsBuilder<FN, NonNullable<NA>, S>;
    params<NA>(get: () => NA): FormActionsBuilder<FN, [NonNullable<NA>], S>;
    /**
     * Précise des paramètres fixes (à l'initialisation) pour l'action de chargement.
     * @param params Paramètres.
     */
    params<NA extends Array<any>>(...params: NA): FormActionsBuilder<FN, NonNullable<NA>, S>;
    params<NA extends Array<any>>(...params: NA): FormActionsBuilder<FN, NonNullable<NA>, S> {
        if (!params.length) {
            // @ts-ignore
            this.getLoadParams = () => [];
        } else if (!isFunction(params[0])) {
            // @ts-ignore
            this.getLoadParams = () => params;
        } else {
            this.getLoadParams = params[0];
        }

        // @ts-ignore
        return this;
    }

    /**
     * Enregistre le service de chargement.
     * @param service Service de chargement.
     */
    load(
        service: A extends never ? never : (...params: A) => Promise<NodeToType<FN> | undefined>
    ): FormActionsBuilder<FN, A, S> {
        this.loadService = service;
        return this;
    }

    /**
     * Enregistre un service de sauvegarde.
     * @param service Service de sauvegarde.
     * @param name Nom du service (si plusieurs).
     */
    save<NS extends string = "default">(
        service: (entity: NodeToType<FN>) => Promise<NodeToType<FN> | void>,
        name?: NS
    ): FormActionsBuilder<FN, A, S | NS> {
        // @ts-ignore
        this.saveServices[name || "default"] = service;
        // @ts-ignore
        return this;
    }

    /**
     * Enregistre un handler
     * @param event Nom de l'évènement.
     * @param handler Handler de l'évènement.
     */
    on<E extends FormActionsEvent>(
        event: E | E[],
        handler: (event: E, saveName?: S) => void
    ): FormActionsBuilder<FN, A, S> {
        if (!Array.isArray(event)) {
            event = [event];
        }

        event.forEach(e => {
            if (!this.handlers[e]) {
                this.handlers[e] = [handler];
            } else {
                this.handlers[e].push(handler);
            }
        });

        return this;
    }

    /**
     * Change le préfixe i18n pour les messages du formulaire.
     * @param prefix: Le préfixe.
     */
    i18nPrefix(prefix: string): FormActionsBuilder<FN, A, S> {
        this.prefix = prefix;
        return this;
    }
    /** Utilise le nom du save dans le message de succès de la sauvegarde (prefix.detail.saved => prefix.detail.name.saved). */
    useSaveNameForMessages(): FormActionsBuilder<FN, A, S> {
        this.saveNamesForMessages = true;
        return this;
    }

    /** Construit le FormActions. */
    build(): FormActions<S> {
        const {getLoadParams, loadService, saveServices, formNode, prefix, saveNamesForMessages, handlers} = this;
        // On se prépare à construire plusieurs actions de sauvegarde.
        function buildSave(name: Extract<keyof S, string>, saveService: (entity: any) => Promise<any | void>) {
            return async function save(this: FormActions<Extract<keyof S, string>>) {
                this.forceErrorDisplay = true;

                // On ne fait rien si on est déjà en chargement.
                if (this.isLoading) {
                    return;
                }

                try {
                    // On ne sauvegarde que si la validation est en succès.
                    if (formNode.form && !formNode.form.isValid) {
                        throw {
                            $validationError: true,
                            detail: formNode.form.errors
                        };
                    }

                    this.isLoading = true;
                    const data = await saveService(toFlatValues(formNode));
                    runInAction("afterSave", () => {
                        this.isLoading = false;
                        formNode.form.isEdit = false;
                        if (data) {
                            // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                            if (isStoreNode(formNode.sourceNode)) {
                                formNode.sourceNode.replace(data);
                            } else {
                                formNode.sourceNode.replaceNodes(data);
                            }
                        }
                    });

                    // Pour supprimer le message, il "suffit" de faire en sorte qu'il soit vide.
                    const savedMessage = i18next.t(
                        `${prefix || "focus"}.detail${saveNamesForMessages ? `.${name}` : ""}.saved`
                    );
                    if (savedMessage) {
                        messageStore.addSuccessMessage(savedMessage);
                    }

                    // On ne force plus l'affichage des erreurs une fois la sauvegarde effectuée, puisqu'il n'y a plus.
                    this.forceErrorDisplay = false;

                    (handlers.save || []).forEach(handler => handler("save", name as any));
                } catch (e) {
                    (handlers.error || []).forEach(handler => handler("error", name as any));
                    throw e;
                } finally {
                    this.isLoading = false;
                }
            };
        }

        const formActions = observable(
            {
                forceErrorDisplay: false,
                isLoading: false,

                get formProps(): ActionsFormProps {
                    return {
                        forceErrorDisplay: this.forceErrorDisplay,
                        save: this.save
                    };
                },

                get panelProps(): ActionsPanelProps {
                    return {
                        editing: formNode.form.isEdit,
                        loading: this.isLoading,
                        onClickCancel: this.onClickCancel,
                        onClickEdit: this.onClickEdit,
                        save: this.save
                    };
                },

                async load() {
                    // On n'effectue le chargement que si on a un service de chargement et des paramètres pour le service.
                    if (getLoadParams && loadService) {
                        let params = getLoadParams();
                        if (params) {
                            this.isLoading = true;
                            if (!Array.isArray(params)) {
                                params = [params];
                            }
                            const data = await loadService(...params);
                            runInAction("afterLoad", () => {
                                if (data) {
                                    if (isStoreNode(formNode.sourceNode)) {
                                        formNode.sourceNode.replace(data as any);
                                    } else {
                                        formNode.sourceNode.replaceNodes(data as any);
                                    }
                                }

                                this.isLoading = false;
                            });

                            (handlers.load || []).forEach(handler => handler("load"));
                        }
                    }
                },

                onClickCancel() {
                    formNode.form.isEdit = false;
                    formNode.reset();
                    (handlers.cancel || []).forEach(handler => handler("cancel"));
                },

                onClickEdit() {
                    formNode.form.isEdit = true;
                    (handlers.edit || []).forEach(handler => handler("edit"));
                }
            } as FormActions<S>,
            {
                formProps: computed.struct,
                panelProps: computed.struct,
                load: action.bound,
                onClickCancel: action.bound,
                onClickEdit: action.bound
            }
        );

        // On ajoute le ou les actions de sauvegarde.
        Object.entries<(entity: NodeToType<FN>) => Promise<NodeToType<FN> | void>>(saveServices).forEach(
            ([name, service]) => {
                extendObservable(
                    formActions,
                    {save: buildSave(name as Extract<keyof S, string>, service)},
                    {save: action.bound}
                );
            }
        );

        // On met en place la réaction de chargement.
        if (getLoadParams) {
            formActions.dispose = reaction(getLoadParams, formActions.load, {equals: comparer.structural});
        }

        // On appelle le chargement.
        formActions.load();

        return formActions;
    }
}
