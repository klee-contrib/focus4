import {merge} from "es-toolkit";
import i18next from "i18next";
import {action, autorun, computed, observable, runInAction} from "mobx";

import {messageStore, requestStore, Router, RouterConfirmation} from "@focus4/core";

import {LoadRegistration, NodeLoadBuilder, toFlatValues} from "../store";
import {FormListNode, FormNode, isFormEntityField, isFormNode, isStoreNode, SourceNodeType} from "../types";

interface FormActionHandlers<
    FN extends FormNode | FormListNode,
    C extends SourceNodeType<FN> | void | string | number,
    U extends SourceNodeType<FN> | void | string | number,
    S extends SourceNodeType<FN> | void | string | number
> {
    init?: ((event: "init", data: SourceNodeType<FN>) => void)[];
    load?: ((event: "load", data: SourceNodeType<FN>) => void)[];
    cancel?: ((event: "cancel") => void)[];
    edit?: ((event: "edit") => void)[];
    create?: ((event: "create", data: C) => void)[];
    update?: ((event: "update", data: U) => void)[];
    save?: ((event: "save", data: S) => void)[];
    error?: ((event: "error", data: "load" | "init" | "save" | "create" | "update", error: unknown) => void)[];
}

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
    protected declare builder: FormActionsBuilder<FormListNode | FormNode, A, any, any, any>;

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
        (this.builder.handlers.cancel ?? []).forEach(handler => handler("cancel"));
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
        (this.builder.handlers.edit ?? []).forEach(handler => handler("edit"));
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
                // eslint-disable-next-line @typescript-eslint/only-throw-error
                throw {
                    $validationError: true,
                    detail: this.formNode.form.errors
                };
            }

            const data = await requestStore.track<object>([this.trackingId, ...this.builder.trackingIds], () => {
                const d = toFlatValues(this.formNode);
                if (this.builder.saveService) {
                    return this.builder.saveService(d);
                } else if (this.params && this.builder.updateService) {
                    return this.builder.updateService(...[...this.params, d]);
                } else {
                    return this.builder.createService!(d);
                }
            });
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

                if (data && typeof data === "object" && !(data instanceof Response)) {
                    // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                    if (isStoreNode(this.formNode.sourceNode)) {
                        this.formNode.sourceNode.replace(data);
                    } else {
                        this.formNode.sourceNode.replaceNodes(data as any);
                    }
                    // Si on a pas de retour du serveur, on sauvegarde à la place les données du formulaire dans le noeud de store.
                } else if (isFormNode(this.formNode)) {
                    this.formNode.sourceNode.replace(this.formNode);
                } else {
                    this.formNode.sourceNode.replaceNodes(this.formNode);
                }
            });

            if (this.builder.message) {
                messageStore.addSuccessMessage(i18next.t(this.builder.message));
            }

            // On ne force plus l'affichage des erreurs une fois la sauvegarde effectuée, puisqu'il n'y a plus.
            if (this.actionsErrorDisplay === "after-focus") {
                this.errorDisplay = "after-focus";
            }

            (this.builder.handlers[service] ?? []).forEach(handler => handler(service as never, data as any));
        } catch (e: unknown) {
            (this.builder.handlers.error ?? []).forEach(handler => handler("error", service, e));
            throw e;
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
                    this.formNode.sourceNode.replace(this.formNode.form._initialData);
                } else {
                    this.formNode.sourceNode.replaceNodes(this.formNode.form._initialData!);
                }

                (this.builder.handlers.init ?? []).forEach(handler => handler("init", initData));
            } catch (e: unknown) {
                this.clear();
                (this.builder.handlers.error ?? []).forEach(handler => handler("error", "init", e));
                throw e;
            }
        }
    }
}

export class FormActionsBuilder<
    FN extends FormListNode | FormNode,
    P extends readonly any[] = never,
    C extends SourceNodeType<FN> | void | string | number = never,
    U extends SourceNodeType<FN> | void | string | number = never,
    S extends SourceNodeType<FN> | void | string | number = never
> extends NodeLoadBuilder<FN["sourceNode"], P> {
    /** @internal */
    readonly handlers: FormActionHandlers<FN, C, U, S> = {};

    /** @internal */
    actionsErrorDisplay?: "after-focus" | "always" | "never";
    /** @internal */
    confirmation?: RouterConfirmation;
    /** @internal */
    message = "focus.detail.saved";
    /** @internal */
    hasInit = false;
    /** @internal */
    initService?: () => Promise<SourceNodeType<FN>>;
    /** @internal */
    createService?: (entity: SourceNodeType<FN>) => Promise<C>;
    /** @internal */
    updateService?: (...params: [...P, SourceNodeType<FN>]) => Promise<U>;
    /** @internal */
    saveService?: (entity: SourceNodeType<FN>) => Promise<S>;

    /**
     * Précise la getter permettant de récupérer la liste des paramètres pour l'action de chargement.
     * Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification.
     * @param get Getter.
     */
    override params<const NP extends any[]>(
        get: () => NP | undefined
    ): FormActionsBuilder<FN, NonNullable<NP>, C, U, S>;
    override params<NP>(get: () => NP): FormActionsBuilder<FN, [NonNullable<NP>], C, U, S>;
    /**
     * Précise des paramètres fixes (à l'initialisation) pour l'action de chargement.
     * @param params Paramètres.
     */

    override params(): FormActionsBuilder<FN, [], C, U, S>;
    override params<const NP extends any[]>(params: NP): FormActionsBuilder<FN, NonNullable<NP>, C, U, S>;
    override params<NP>(params: NP): FormActionsBuilder<FN, [NonNullable<NP>], C, U, S>;
    override params<const NP extends any[]>(params?: NP | (() => NP | undefined)): any {
        return super.params(params);
    }

    /**
     * Enregistre un service d'initilisation du formulaire, qui sera appelé au premier rendu pour compléter les données
     * déjà présentes dans le `formNode`, s'il n'y a pas de `load` a appeler.
     *
     * Les données seront ensuite recopiées dans le noeud source, afin de pouvoir correctement identifier les données
     * qui ont été saisies par l'utilisateur dans le formulaire (via `formNode.form.hasChanged`).
     *
     * La méthode peut aussi être appelée sans service, simplement pour effectuer la recopie (ou un clear) du noeud source.
     * @param service Service d'initialisation.
     */
    init(service?: () => Promise<SourceNodeType<FN>>) {
        this.hasInit = true;
        this.initService = service;
        return this;
    }

    /**
     * Enregistre le service de chargement.
     * @param service Service de chargement.
     */
    override load(
        service: P extends never ? never : (...params: [...P, RequestInit?]) => Promise<SourceNodeType<FN>>
    ): FormActionsBuilder<FN, P, C, U, S> {
        return super.load(service) as any;
    }

    /**
     * Enregistre un service de création, appelé par `actions.save()` si les `params` sont `undefined`.
     * @param service Service de création.
     */
    create<NC extends SourceNodeType<FN> | void | string | number>(
        service: (entity: SourceNodeType<FN>) => Promise<NC>
    ): FormActionsBuilder<FN, P, NC, U, S> {
        if (this.saveService) {
            throw new Error("Impossible de spécifier un `create` en même temps qu'un `save`.");
        }

        // @ts-ignore
        this.createService = service;
        // @ts-ignore
        return this as any;
    }

    /**
     * Enregistre un service de mise à jour, appelé par `actions.save()` si les `params` ne sont pas `undefined`.
     *
     * Le service sera appelé avec les `params`, puis le contenu du `formNode`.
     * @param service Service de mise à jour.
     */
    update<NU extends SourceNodeType<FN> | void | string | number>(
        service: (...params: [...P, SourceNodeType<FN>]) => Promise<NU>
    ): FormActionsBuilder<FN, P, C, NU, S> {
        if (this.saveService) {
            throw new Error("Impossible de spécifier un `update` en même temps qu'un `save`.");
        }

        // @ts-ignore
        this.updateService = service;
        // @ts-ignore
        return this;
    }

    /**
     * Enregistre un service de sauvegarde, appelé par `actions.save()`.
     * @param service Service de sauvegarde.
     */
    save<NS extends SourceNodeType<FN> | void | string | number>(
        service: (entity: SourceNodeType<FN>) => Promise<NS>
    ): FormActionsBuilder<FN, P, C, U, NS> {
        if (this.createService || this.updateService) {
            throw new Error("Impossible de spécifier un `save` en même temps qu'un `create` ou un `update`.");
        }

        // @ts-ignore
        this.saveService = service;
        // @ts-ignore
        return this;
    }

    /**
     * Enregistre un handler
     * @param event Nom de l'évènement.
     * @param handler Handler de l'évènement.
     */
    override on<E extends keyof FormActionHandlers<FN, C, U, S>>(
        event: E | E[],
        handler: (
            event: E,
            data: Parameters<NonNullable<FormActionHandlers<FN, C, U, S>[E]>[0]>[1],
            error: Parameters<NonNullable<FormActionHandlers<FN, C, U, S>[E]>[0]>[2]
        ) => void
    ): FormActionsBuilder<FN, P, C, U, S> {
        return super.on(event as any, handler as any) as any;
    }

    /**
     * Attache un (ou plusieurs) ids de suivi de requêtes au service de chargement (en plus de l'id par défaut).
     *
     * Cela permettra d'ajouter l'état du service au `isLoading` de cet(ces) id(s).
     * @param trackingIds Id(s) de suivi.
     */
    override trackingId(...trackingIds: string[]): FormActionsBuilder<FN, P, C, U, S> {
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
    errorDisplay(mode: "after-focus" | "always" | "never") {
        this.actionsErrorDisplay = mode;
        return this;
    }

    /**
     * Surcharge le message de succès à la sauvegarde du formulaire. Si le message est vide, aucun message ne sera affiché.
     * @param message Le message de succès.
     */
    successMessage(message: string) {
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
