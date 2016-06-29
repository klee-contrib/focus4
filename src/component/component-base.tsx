import * as React from "react";
import {autobind} from "core-decorators";
import {v4} from "node-uuid";
import {setHeader, ApplicationAction} from "../application";
import {translate} from "../translation";
import * as defaults from "./defaults";

/** Options de base pour `listFor` et `tableFor`. */
export interface ListOptions<ListProps, LineProps> {
    listComponent?: defaults.ReactComponent<ListProps>;
    LineComponent?: defaults.ReactComponent<LineProps>;
    perPage?: number;
    isEdit?: boolean;
}

/** Classe de base pour un composant Focus simple. */
@autobind
export class ComponentBase<P, S> extends React.Component<P, S> {

    /** Identifieur unique de l'instance du composant. */
    readonly _identifier = v4();

    // Ajoute une signature d'index au props et state par practicité.
    readonly props: P & {[key: string]: any};
    readonly state: S & {[key: string]: any};

    /**
     * Crée une nouvelle instance de ComponentBase.
     * @param props Les props du composant.
     */
    constructor(props: P) {
        super(props);
        this.state = {} as S;
    }

    componentWillMount() {
        this.registerCartridge();
    }

    /** Définit la configuration du cartridge. */
    cartridgeConfiguration(): ApplicationAction | undefined {
        return undefined;
    }

    /**
     * Traduit une clé.
     * @param key La clé.
     */
    i18n(key: string): string {
        return translate(key);
    }

    /** Enregistre le cartridge dans le store applicatif. */
    registerCartridge() {
        const cartridge = this.cartridgeConfiguration();
        if (cartridge) {
            setHeader(cartridge);
        }
    }

    /**
     * Crée un composant de liste à partir de la liste fournie.
     * @param data La liste.
     * @param options Les options.
     */
    listFor<ListProps, LineProps>(data: {}[], options: ListOptions<ListProps, LineProps> & ListProps & LineProps) {
        const {MemoryList, List} = defaults;
        if (!MemoryList) {
            throw new Error("Le composant MemoryList n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts.");
        }

        const defaultProps = {
            data: data || [],
            listComponent: options.listComponent || List,
            perPage: 5,
            reference: this.state["reference"],
            isEdit: false
        };

        if (!defaultProps.listComponent) {
            throw new Error("Aucun listComponent spécifié. Vous manque-t-il un défaut ?");
        }

        const finalProps = Object.assign(defaultProps, options);
        return <MemoryList ref="list" {...finalProps} />;
    }

    /**
     * Crée un composant de tableau à partir de la liste fournie.
     * @param data La liste.
     * @param options Les options.
     */
    tableFor<ListProps, LineProps>(data: {}[], options: ListOptions<ListProps, LineProps> & ListProps & LineProps) {
        options.listComponent = options.listComponent || defaults.Table;
        return this.listFor(data, options);
    }
}
