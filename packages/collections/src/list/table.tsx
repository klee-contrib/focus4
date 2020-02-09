import classNames from "classnames";
import i18next from "i18next";
import {observer} from "mobx-react";
import {useObserver} from "mobx-react-lite";
import * as React from "react";

import {themr, useTheme} from "@focus4/styling";

import {ListBase, ListBaseProps, listCss} from "./list-base";

const Theme = themr("list", listCss);

/** Colonne de tableau. */
export interface TableColumn<T> {
    /** Classe CSS pour la colonne. */
    className?: string;
    /** Contenu de la colonne. */
    content: (data: T) => React.ReactNode;
    /** Libellé du titre de la colonne. */
    title: string;
}

/** Props du tableau de base. */
export interface TableProps<T> extends ListBaseProps<T> {
    /** Classe CSS pour une ligne. */
    lineClassName?: (data: T) => string;
    /** Appelé au clic sur une ligne. */
    onLineClick?: (data: T) => void;
}

/** Tableau standard */
@observer
export class Table<
    T,
    P extends TableProps<T> = TableProps<T> & {data: T[]; columns: TableColumn<T>[]}
> extends ListBase<T, P> {
    /** Les données. */
    protected get data() {
        return (this.props as any).data || [];
    }

    /** Affiche le header du tableau. */
    protected renderTableHeader() {
        return (
            <thead>
                <tr>
                    {((this.props as any).columns as TableColumn<T>[]).map(({title}) => (
                        <th key={title}>{i18next.t(title)}</th>
                    ))}
                </tr>
            </thead>
        );
    }

    /** Ligne de table. */
    protected TableLine = React.forwardRef<HTMLTableRowElement, {data: T}>(({data}, ref) => {
        const {onLineClick, lineClassName, theme: pTheme} = this.props;
        const theme = useTheme("list", listCss, pTheme);
        return useObserver(() => (
            <tr
                ref={ref}
                className={classNames(lineClassName ? lineClassName(data) : "", onLineClick ? theme.clickable() : "")}
            >
                {((this.props as any).columns as TableColumn<T>[]).map(({className, content}, idx) => (
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
                        <table className={theme.table()}>
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
export function tableFor<T>(props: TableProps<T> & {data: T[]; columns: TableColumn<T>[]}) {
    return <Table<T> {...props} />;
}
