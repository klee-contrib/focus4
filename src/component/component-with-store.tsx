import {isArray} from "lodash";

import {ComponentBase} from "./component-base";
import {addSuccessMessage} from "../message";
import {changeMode} from "../application";
import {CoreStore} from "../store";
import {builtInStore, builtInReferenceAction} from "../reference";

/** Informations renvoyées par une modification de store. */
export interface ChangeInfos {
    status: {name: string};
    informations: {callerId: string};
    property: string;
}

/** State propre à ComponentWithStore. */
export interface CWSState {
    isEdit?: boolean;
    isLoading?: boolean;
    reference?: {[refName: string]: {[key: string]: any}[]};
}

/** Classe de base pour un composant Focus avec un store. */
export abstract class ComponentWithStore<P, S, TS extends {[key: string]: any}> extends ComponentBase<P, S & TS & CWSState> {

    private referenceStore = builtInStore;
    private referenceNames?: string[];
    private store?: CoreStore<TS>;
    private storeNodes?: TS;
    private restrictOnChangeOnSelf: boolean;
    private initWithStore: boolean;

    /**
     * Crée une nouvelle instance de ComponentWithStore.
     * @param config La config du composant.
     */
    constructor({props, store, storeNodes, referenceNames, restrictOnChangeOnSelf = false, initWithStore = true}: {
        props: P,
        store?: CoreStore<TS>,
        storeNodes?: TS,
        referenceNames?: string[],
        restrictOnChangeOnSelf?: boolean,
        initWithStore?: boolean
    }) {
        super(props);
        this.store = store;
        this.storeNodes = storeNodes;
        this.referenceNames = referenceNames;
        this.restrictOnChangeOnSelf = restrictOnChangeOnSelf;
        this.initWithStore = initWithStore;

        if (storeNodes) {
            for (const node in storeNodes) {
                this.state[node] = isArray(storeNodes[node]) ? [] : {};
            }
        }

        this.state.reference = {};
        if (referenceNames) {
            for (const ref in referenceNames) {
                this.state.reference[referenceNames[ref]] = [];
            }
        }

        this.afterChange = this.afterChange.bind(this);
        this.getErrorStateFromStore = this.getErrorStateFromStore.bind(this);
        this.getLoadingStateFromStore = this.getLoadingStateFromStore.bind(this);
        this.getStateFromStore = this.getStateFromStore.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onError = this.onError.bind(this);
        this.onStatus = this.onStatus.bind(this);
        this.onStoreDeleted = this.onStoreDeleted.bind(this);
        this.onStoreLoaded = this.onStoreLoaded.bind(this);
        this.onStoreSaved = this.onStoreSaved.bind(this);
        this.registerStore = this.registerStore.bind(this);
    }

    componentWillMount() {
        super.componentWillMount();

        if (!this.store && this.storeNodes && Object.keys(this.storeNodes).length > 0) {
            throw new Error("Impossible de définir des noeuds de store sans store.");
        } else if (this.store && (!this.storeNodes || Object.keys(this.storeNodes).length === 0)) {
            throw new Error("Impossible de définir un store sans noeuds de store.");
        }

        if (this.store) {
            this.registerStore(this.store, Object.keys(this.storeNodes), "add");
        }
        if (this.referenceNames) {
            this.registerStore(this.referenceStore, this.referenceNames, "add");
            builtInReferenceAction(this.referenceNames)();
        }

        if (this.initWithStore) {
            this.setState(this.getStateFromStore() as any);
        }
    }

    componentWillUnmount() {
        if (this.store) {
            this.registerStore(this.store, Object.keys(this.storeNodes), "remove");
        }
        if (this.referenceNames) {
            this.registerStore(this.referenceStore, this.referenceNames, "remove");
        }
    }

    /**
     * Est appelé après la mise à jour du state par un store.
     * Repasse le composant en mode consultation et appelle `onStoreLoaded`, `onStoreSaved` ou `onStoreDeleted`.
     * @param changeOptions Les informations de la mise à jour.
     */
    afterChange(changeOptions: ChangeInfos) {
        if (changeOptions.status || this.referenceNames && this.referenceNames.find(x => x === changeOptions.property)) {
            let {callerId} = changeOptions.informations;
            let name = changeOptions.status ? changeOptions.status.name : "loaded";
            let {property} = changeOptions;
            const triggerOnChange = !this.restrictOnChangeOnSelf || callerId === this._identifier;

            if ("loaded" === name) {
                this.onStoreLoaded(property);
            } else if ("saved" === name) {
                if (this.state.isEdit) {
                    this.setState({isEdit: false} as any, () => changeMode("consult", "edit"));
                }
                if (triggerOnChange) {
                    this.onStoreSaved(property);
                }
            } else if ("deleted" === name) {
                if (triggerOnChange) {
                    this.onStoreDeleted(property);
                }
            }
        }
    }

    /**
     * Est appelé en cas d'erreur sur le store.
     * Récupère les erreurs et les écrit dans le state.
     */
    getErrorStateFromStore() {
        const storeNodes = this.storeNodes && Object.keys(this.storeNodes) || [];

        let newState: {[key: string]: any} = {};
        storeNodes.map(property => {
            const errorState = this.store!.getError(property);
            if (errorState) {
                for (const prop in errorState) {
                    newState[`${property}.${prop}`] = errorState[prop];
                }
            }
        });
        return newState;
    }

    /**
     * Est appelé lorsque le store est en chargement.
     * Récupère l'état global du composant (`isLoading` vrai ou faux).
     */
    getLoadingStateFromStore() {
        const storeNodes = this.storeNodes && Object.keys(this.storeNodes) || [];

        let isLoading: boolean | undefined = false;
        storeNodes.forEach(property => {
            if (!isLoading) {
                let propStatus = this.store!.getStatus(property) || {isLoading: undefined};
                isLoading = propStatus.isLoading;
            }
        });

        return {isLoading};
    }

    /**
     * Est appelé à la modification d'un store.
     * Récupère l'état d'un (ou de tous les) noeud(s) du store et l'écrit dans le state.
     * @param property Le noeud de store.
     */
    getStateFromStore(property?: string): TS & CWSState {
        let newState: {[key: string]: any, reference: {[key: string]: {}[]}} = {reference: this.state.reference || {}};

        const referenceNames = this.referenceNames || [];
        const storeNodes = this.storeNodes && Object.keys(this.storeNodes) || [];

        if (property) {
            const isReference = !!referenceNames.find(r => r === property);
            if (isReference && referenceNames.indexOf(property) !== -1) {
                const nextValue = this.referenceStore.get<{}[]>(property);
                if (nextValue) {
                    newState.reference[property] = nextValue;
                }
            } else if (storeNodes.indexOf(property) !== -1) {
                newState[property] = this.store!.get(property) || this.storeNodes![property];
            }
        } else {
            storeNodes.map(node => {
                newState[node] = this.store!.get(node) || this.storeNodes![node];
            });
            referenceNames.map(node => {
                const nextValue = this.referenceStore.get<{}[]>(node);
                if (nextValue) {
                    newState.reference[node] = nextValue;
                }
            });
        }
        return Object.assign(newState, this.getLoadingStateFromStore()) as any;
    }

    /**
     * Est appelé lors d'une modification de store.
     * Appelle `getStateFromStore` puis `afterChange`.
     * @param changeOptions Les informations de la mise à jour.
     */
    onChange(changeInfos: ChangeInfos) {
        this.setState(this.getStateFromStore(changeInfos.property) as any, () => this.afterChange(changeInfos));
    }

    /**
     * Est appelé lors d'une erreur de store.
     * Appelle `getErrorStateFromStore`.
     * @param changeOptions Les informations de la mise à jour.
     */
    onError(changeInfos: ChangeInfos) {
        const errorState = this.getErrorStateFromStore();
        for (let key in errorState) {
            if (this.refs[key]) {
                (this.refs[key] as any).setError(errorState[key]);
            }
        }
        this.setState(this.getLoadingStateFromStore() as any);
    }

    /**
     * Est appelé lors de du changement de status du store.
     * Appelle `getLoadingStateFromStore`.
     * @param changeOptions Les informations de la mise à jour.
     */
    onStatus(changeInfos: ChangeInfos) {
        this.setState(this.getLoadingStateFromStore() as any);
    }

    /**
     * Est appelé par `afterChange`.
     * Affiche un message de confirmation de suppression.
     * @param property Le noeud de store.
     */
    onStoreDeleted(property?: string) {
        addSuccessMessage("detail.deleted");
    }

    /**
     * Est appelé par `afterChange`.
     * @param property Le noeud de store.
     */
    onStoreLoaded(property?: string) {
        // A surcharger.
    }

    /**
     * Est appelé par `afterChange`.
     * Affiche un message de confirmation de sauvegarde.
     * @param property Le noeud de store.
     */
    onStoreSaved(property?: string) {
        addSuccessMessage("detail.saved");
    }

    private registerStore(store: CoreStore<any>, nodes: string[], action: 'add' | 'remove') {
        if (action === "add") {
            nodes.map(property => {
                store.addChangeListener(property, this.onChange);
                store.addErrorListener(property, this.onChange);
                store.addStatusListener(property, this.onChange);
            });
        } else {
            nodes.map(property => {
                store.removeChangeListener(property, this.onChange);
                store.removeErrorListener(property, this.onChange);
                store.removeStatusListener(property, this.onChange);
            });
        }
    }
}
