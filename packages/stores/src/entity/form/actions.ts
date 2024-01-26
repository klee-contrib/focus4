import i18next from "i18next";
import {action, computed, extendObservable, observable, runInAction} from "mobx";

import {messageStore, requestStore} from "@focus4/core";

import {LoadRegistration, NodeLoadBuilder, registerLoad, toFlatValues} from "../store";
import {FormListNode, FormNode, isFormEntityField, isFormNode, isStoreNode, NodeToType} from "../types";

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
export type FormActions<S extends string = "default"> = ActionsFormProps &
    LoadRegistration & {
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
    FN extends FormListNode | FormNode,
    A extends readonly any[] = never,
    S extends string = never
> extends NodeLoadBuilder<FN["sourceNode"], A> {
    /** @internal */
    readonly handlers = {} as Record<FormActionsEvent, ((event: FormActionsEvent, saveName?: S) => void)[]>;

    protected readonly saveServices = {} as Record<S, (entity: NodeToType<FN>) => Promise<NodeToType<FN> | void>>;
    protected readonly formNode: FN;

    protected prefix = "focus";
    protected saveNamesForMessages = false;

    constructor(formNode: FN) {
        super();
        this.formNode = formNode;
    }

    /**
     * Précise la getter permettant de récupérer la liste des paramètres pour l'action de chargement.
     * Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification.
     * @param get Getter.
     */
    params<const NA extends any[]>(get: () => NA | undefined): FormActionsBuilder<FN, NonNullable<NA>, S>;
    params<NA>(get: () => NA): FormActionsBuilder<FN, [NonNullable<NA>], S>;
    /**
     * Précise des paramètres fixes (à l'initialisation) pour l'action de chargement.
     * @param params Paramètres.
     */
    params<const NA extends any[]>(...params: NA): FormActionsBuilder<FN, NonNullable<NA>, S>;
    params<const NA extends any[]>(...params: NA): FormActionsBuilder<FN, NonNullable<NA>, S> {
        return super.params(...params) as any;
    }

    /**
     * Enregistre le service de chargement.
     * @param service Service de chargement.
     */
    load(
        service: A extends never ? never : (...params: A) => Promise<NodeToType<FN> | undefined>
    ): FormActionsBuilder<FN, A, S> {
        return super.load(service) as any;
    }

    /**
     * Enregistre un service de sauvegarde.
     * @param service Service de sauvegarde.
     * @param name Nom du service (si plusieurs).
     */
    save<NS extends string = "default">(
        service: (entity: NodeToType<FN>) => Promise<NodeToType<FN> | void>,
        name?: NS
    ): FormActionsBuilder<FN, A, NS | S> {
        // @ts-ignore
        this.saveServices[name ?? "default"] = service;
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
        return super.on(event as any, handler as any) as any;
    }

    /**
     * Attache un (ou plusieurs) ids de suivi de requêtes au service de chargement (en plus de l'id par défaut).
     *
     * Cela permettra d'ajouter l'état du service au `isLoading` de cet(ces) id(s).
     * @param trackingIds Id(s) de suivi.
     */
    trackingId(...trackingIds: string[]): FormActionsBuilder<FN, A, S> {
        return super.trackingId(...trackingIds) as any;
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
        const {saveServices, formNode, prefix, saveNamesForMessages, handlers, trackingIds} = this;
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
                        // eslint-disable-next-line @typescript-eslint/no-throw-literal
                        throw {
                            $validationError: true,
                            detail: formNode.form.errors
                        };
                    }

                    const data = await requestStore.track([loadObject.trackingId, ...trackingIds], () =>
                        saveService(toFlatValues(formNode))
                    );
                    runInAction(() => {
                        formNode.form.isEdit = false;

                        // On met à jour le _initialData avec les valeurs qu'on avait à la sauvegarde.
                        function updateInitialData(source: unknown, target: unknown) {
                            if (isFormNode(source) && target && typeof target === "object") {
                                for (const key in source) {
                                    const item = source[key];
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
                        updateInitialData(formNode, formNode.form._initialData);

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
                } catch (e: unknown) {
                    (handlers.error || []).forEach(handler => handler("error", name as any));
                    throw e;
                }
            };
        }

        const loadObject = registerLoad(this.formNode.sourceNode, this);

        const formActions = observable(
            {
                get dispose() {
                    return loadObject.dispose;
                },

                get isLoading() {
                    return loadObject.isLoading;
                },

                get trackingId() {
                    return loadObject.trackingId;
                },

                forceErrorDisplay: false,

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

                load: formNode.load,

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
            },
            {proxy: false}
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

        return formActions;
    }
}
