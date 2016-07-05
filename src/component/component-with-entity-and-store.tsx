import {ComponentBase} from "./component-base";
import {ComponentWithEntity, CWEState, AutocompleteTextOptions, AutocompleteSelectOptions, DisplayOptions, FieldOptions, SelectOptions, TextOptions} from "./component-with-entity";
import {ComponentWithStore, CWSState, ChangeInfos} from "./component-with-store";
import {autobind, mixin} from "core-decorators";

import {Entity, EntityField} from "../definition";
import {builtInStore} from "../reference";
import {CoreStore} from "../store";

/** Classe de base pour un composant Focus avec une entité et un store. */
/* tslint:disable:no-unused-variable */
@autobind
@mixin(ComponentWithEntity.prototype, ComponentWithStore.prototype)
export abstract class ComponentWithEntityAndStore<P, S, E, TS extends {[key: string]: any}> extends ComponentBase<P, S & TS & CWEState<E> & CWSState> {

    private entity: Entity<E>;
    private referenceStore = builtInStore;
    private referenceNames?: string[];
    private store: CoreStore<TS>;
    private storeNodes?: TS;
    private restrictOnChangeOnSelf: boolean;
    private initWithStore: boolean;

    /**
     * Crée une nouvelle instance de ComponentWithEntityAndStore.
     * `storeNodes` n'inclus PAS le noeud de store de l'entité. Par conséquent, l'entité doit avoir le même nom que le noeud du store.
     * @param config La config du composant.
     */
    constructor({props, entity, store, storeNodes, referenceNames, restrictOnChangeOnSelf = false, initWithStore = true}: {
        props: P,
        entity: Entity<E>,
        store: CoreStore<TS>,
        storeNodes?: TS,
        referenceNames?: string[],
        restrictOnChangeOnSelf?: boolean,
        initWithStore?: boolean
    }) {
        super(props);
        this.entity = entity;
        this.store = store;
        this.storeNodes = storeNodes || {} as TS;
        this.storeNodes[this.entity.name] = {};
        this.referenceNames = referenceNames;
        this.restrictOnChangeOnSelf = restrictOnChangeOnSelf;
        this.initWithStore = initWithStore;

        this.state.entity = {} as E;
        if (storeNodes) {
            for (const node in storeNodes) {
                this.state[node] = _.isArray(storeNodes[node]) ? [] : {};
            }
        }

        this.state.reference = {};
        if (referenceNames) {
            for (const ref in referenceNames) {
                this.state.reference[referenceNames[ref]] = [];
            }
        }
    }

    /**
     * Crée un champ de type AutocompleteSelect.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    autocompleteSelectFor<Props>(field: EntityField, options: AutocompleteSelectOptions<Props> & Props): JSX.Element {
        return ComponentWithEntity.prototype.autocompleteSelectFor.call(this, field, options);
    }

    /**
     * Crée un champ de type AutocompleteText.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    autocompleteTextFor<Props>(field: EntityField, options: AutocompleteTextOptions<Props> & Props): JSX.Element {
        return ComponentWithEntity.prototype.autocompleteTextFor.call(this, field, options);
    }

    /**
     * Crée un champ standard en lecture seule.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    displayFor<Props>(field: EntityField, options?: DisplayOptions<Props> & Props): JSX.Element {
        return ComponentWithEntity.prototype.displayFor.call(this, field, options);
    }

    /**
     * Crée un champ standard.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    fieldFor<DisplayProps, FieldProps, InputProps, InputLabelProps>(
        field: EntityField,
        options?: FieldOptions<DisplayProps, FieldProps, InputProps, InputLabelProps> & DisplayProps & FieldProps & InputProps & InputLabelProps
    ): JSX.Element {
        return ComponentWithEntity.prototype.fieldFor.call(this, field, options);
    }

    /**
     * Crée un champ avec résolution de référence.
     * @param field La définition de champ.
     * @param listName Le nom de la liste de référence.
     * @param options Les options du champ.
     */
    selectFor<Props>(field: EntityField, listName: string, options?: SelectOptions<Props> & Props): JSX.Element {
        return ComponentWithEntity.prototype.selectFor.call(this, field, listName, options);
    }

    /**
     * Récupère le texte correspondant à un champ.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    stringFor(field: EntityField, options: TextOptions = {}): string {
        return ComponentWithEntity.prototype.stringFor.call(this, field, options);
    }

    /**
     * Affiche un champ sous format texte.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    textFor(field: EntityField, options?: TextOptions): JSX.Element {
        return ComponentWithEntity.prototype.textFor.call(this, field, options);
    }

    componentWillMount(): void { return ComponentWithStore.prototype.componentWillMount.call(this); }
    componentWillUnmount(): void { return ComponentWithStore.prototype.componentWillUnmount.call(this); }

    /**
     * Est appelé après la mise à jour du state par un store.
     * Repasse le composant en mode consultation et appelle `onStoreLoaded`, `onStoreSaved` ou `onStoreDeleted`.
     * @param changeOptions Les informations de la mise à jour.
     */
    afterChange(changeInfos: ChangeInfos): void {
        return ComponentWithStore.prototype.afterChange.call(this, changeInfos);
    }

    /**
     * Est appelé en cas d'erreur sur le store.
     * Récupère les erreurs et les écrit dans le state.
     */
    getErrorStateFromStore(): {} {
        return ComponentWithStore.prototype.getErrorStateFromStore.call(this);
    }

    /**
     * Est appelé lorsque le store est en chargement.
     * Récupère l'état global du composant (`isLoading` vrai ou faux).
     */
    getLoadingStateFromStore(): {isLoading: boolean} {
        return ComponentWithStore.prototype.getLoadingStateFromStore.call(this);
    }

    /**
     * Est appelé à la modification d'un store.
     * Récupère l'état d'un (ou de tous les) noeud(s) du store et l'écrit dans le state.
     * Le noeud de l'entité est inscrit dans `this.state.entity`.
     * @param property Le noeud de store.
     */
    getStateFromStore(property?: string) {
        let state: TS & {reference: {[key: string]: {}}, isLoading: boolean, entity: E} = ComponentWithStore.prototype.getStateFromStore.call(this, property);
        const entityKey = Object.keys(state).find(key => key === this.entity.name);
        if (entityKey) {
            state.entity = state[entityKey];
            delete state[entityKey];
        }
        return state;
    }

    /**
     * Est appelé par `afterChange`.
     * Affiche un message de confirmation de suppression.
     * @param property Le noeud de store.
     */
    onStoreDeleted(property?: string): void {
        return ComponentWithStore.prototype.onStoreDeleted.call(this, property);
    }

    /**
     * Est appelé par `afterChange`.
     * @param property Le noeud de store.
     */
    onStoreLoaded(property?: string): void {
        return ComponentWithStore.prototype.onStoreLoaded.call(this, property);
    }

    /**
     * Est appelé par `afterChange`.
     * Affiche un message de confirmation de sauvegarde.
     * @param property Le noeud de store.
     */
    onStoreSaved(property?: string): void {
        return ComponentWithStore.prototype.onStoreSaved.call(this, property);
    }

    private onChange(changeInfos: ChangeInfos): void { return ComponentWithStore.prototype.onChange.call(this, changeInfos); }
    private onError(changeInfos: ChangeInfos): void { return ComponentWithStore.prototype.onError.call(this, changeInfos); }
    private onStatus(changeInfos: ChangeInfos): void { return ComponentWithStore.prototype.onStatus.call(this, changeInfos); }
}
