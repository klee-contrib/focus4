import {Router, RouterConfirmation} from "@focus4/core";

import {LocalCollectionStore} from "../../../collection";
import {NodeLoadBuilder} from "../../store";
import {FormListNode, FormNode, SourceNodeType} from "../../types";

type LoadData<FN extends FormNode | FormListNode | LocalCollectionStore> = FN extends LocalCollectionStore
    ? FN["list"]
    : // @ts-ignore
      SourceNodeType<FN>;

interface FormActionHandlers<
    FN extends FormNode | FormListNode,
    C extends SourceNodeType<FN> | void | string | number,
    U extends SourceNodeType<FN> | void | string | number,
    S extends SourceNodeType<FN> | void | string | number
> {
    init?: ((event: "init", data: SourceNodeType<FN>) => void)[];
    load?: ((event: "load", data: LoadData<FN>) => void)[];
    cancel?: ((event: "cancel") => void)[];
    edit?: ((event: "edit") => void)[];
    create?: ((event: "create", data: C) => void)[];
    update?: ((event: "update", data: U) => void)[];
    save?: ((event: "save", data: S) => void)[];
    error?: ((event: "error", data: "load" | "init" | "save" | "create" | "update", error: unknown) => void)[];
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
        service: P extends never ? never : (...params: [...P, RequestInit?]) => Promise<LoadData<FN>>
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
