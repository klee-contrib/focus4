import {autobind} from "core-decorators";
import {v4} from "node-uuid";
import * as React from "react";

import {setHeader, ApplicationAction} from "application";
import {ReactComponent} from "defaults";
import {ListSelection, ListSelectionProps} from "list/component/list-selection";
import {ListTable, ListTableProps} from "list/component/list-table";
import {MemoryList, CLProps, BaseListProps} from "list/component/memory-list";
import {translate} from "translation";



/** Classe de base pour un composant Focus simple. */
@autobind
export abstract class ComponentBase<P, S> extends React.Component<P, S> {

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
     * Crée un composant de liste (par défaut) à partir de la liste fournie.
     * @param data La liste.
     * @param options Les options.
     */
    listFor<LineProps extends CLProps<{}>>(data: {}[], options: BaseListProps & {perPage?: number} & ListSelectionProps<LineProps>) {
        return this.listForWith(ListSelection, data, options);
    }

    /**
     * Crée un composant de liste personnalisé à partir de la liste fournie.
     * @param ListComponent Le component de liste.
     * @param data La liste.
     * @param options Les options.
     */
    listForWith<ListProps extends BaseListProps>(ListComponent: ReactComponent<ListProps>, data: {}[], options: BaseListProps & {perPage?: number} & ListProps) {
        const defaultProps = {
            data: data || [],
            ListComponent,
            reference: this.props["reference"] || this.state["reference"],
            isEdit: false
        };

        const finalProps = Object.assign(defaultProps, options);
        return <MemoryList ref="list" {...finalProps} />;
    }

    /**
     * Crée un composant de tableau à partir de la liste fournie.
     * @param data La liste.
     * @param options Les options.
     */
    tableFor<LineProps extends CLProps<{}>>(data: {}[], options: BaseListProps & {perPage?: number} & ListTableProps<LineProps>) {
        return this.listForWith(ListTable, data, options);
    }
}
