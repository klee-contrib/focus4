import i18next from "i18next";
import {observer, useObserver} from "mobx-react";
import * as React from "react";

import {themr, useTheme} from "../../../theme";

import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";
const Theme = themr("list", styles);

/** Props du tableau de base. */
export interface TableProps<T> extends ListBaseProps<T> {
    /** La description des colonnes du tableau. */
    columns: {
        /** Classe CSS pour la colonne. */
        className?: string;
        /** Contenu de la colonne. */
        content: (data: T) => React.ReactNode;
        /** Libellé du titre de la colonne. */
        title: string;
    }[];
    /** Appelé au clic sur une ligne. */
    onLineClick?: (data: T) => void;
}

/** Tableau standard */
@observer
export class Table<T, P extends TableProps<T> = TableProps<T> & {data: T[]}> extends ListBase<T, P> {
    /** Les données. */
    protected get data() {
        return (this.props as any).data || [];
    }

    /** Affiche le header du tableau. */
    protected renderTableHeader() {
        return (
            <thead>
                <tr>
                    {this.props.columns.map(({title}) => (
                        <th key={title}>{i18next.t(title)}</th>
                    ))}
                </tr>
            </thead>
        );
    }

    /** Ligne de table. */
    protected TableLine = React.forwardRef<HTMLTableRowElement, {data: T}>(({data}, ref) => {
        const {onLineClick, theme} = this.props;
        const {clickable} = useTheme("list", styles, theme);
        return useObserver(() => (
            <tr ref={ref} className={onLineClick ? clickable : undefined}>
                {this.props.columns.map(({className, content}, idx) => (
                    <td className={className} key={idx} onClick={() => (onLineClick ? onLineClick(data) : undefined)}>
                        {content(data)}
                    </td>
                ))}
            </tr>
        ));
    });

    /** Affiche le corps du tableau. */
    protected renderTableBody() {
        const {itemKey, pageItemIndex = 5} = this.props;
        return (
            <tbody>
                {this.displayedData.map((item, idx) => (
                    <this.TableLine
                        ref={
                            this.displayedData.length - idx === pageItemIndex ||
                            (this.displayedData.length < pageItemIndex && this.displayedData.length - 1 === idx)
                                ? this.registerSentinel
                                : undefined
                        }
                        key={itemKey(item, idx)}
                        data={item}
                    />
                ))}
            </tbody>
        );
    }

    render() {
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <>
                        <table className={theme.table}>
                            {this.renderTableHeader()}
                            {this.renderTableBody()}
                        </table>
                        {this.renderBottomRow(theme)}
                    </>
                )}
            </Theme>
        );
    }
}

/**
 * Crée un composant de tableau standard.
 * @param props Les props du tableau.
 */
export function tableFor<T>(props: TableProps<T> & {data: T[]}) {
    return <Table<T> {...props} />;
}
