import classNames from "classnames";
import i18next from "i18next";
import {action} from "mobx";
import {useObserver} from "mobx-react-lite";
import * as React from "react";

import {ListStoreBase} from "@focus4/stores";
import {IconButton} from "@focus4/toolbox";

import {CSSProp, getIcon, useTheme} from "@focus4/styling";
import {ListBaseProps, useListBase} from "./list-base";

import tableCss, {TableCss} from "./__style__/table.css";
export {tableCss, TableCss};

/** Colonne de tableau. */
export interface TableColumn<T> {
    /** Classe CSS pour la colonne. */
    className?: string;
    /** Contenu de la colonne. */
    content: (data: T) => React.ReactNode;
    /** Libellé du titre de la colonne. */
    title: string;
    /** Si la colonne est triable, le nom du champ sur lequel on doit trier. */
    sortKey?: string;
}

/** Props du tableau de base. */
export type TableProps<T> = ListBaseProps<T> & {
    /** La description des colonnes du tableau. */
    columns: TableColumn<T>[];
    /** Classe CSS pour une ligne. */
    lineClassName?: (data: T) => string;
    /** Appelé au clic sur une ligne. */
    onLineClick?: (data: T) => void;
    /** CSS. */
    theme?: CSSProp<TableCss>;
} & (
        | {
              /** Les données du tableau. */
              data: T[];
          }
        | {
              /** Le store contenant la liste. */
              store: ListStoreBase<T>;
          }
    );

/** Tableau standard */
export function Table<T>({columns, lineClassName, onLineClick, theme: pTheme, ...baseProps}: TableProps<T>) {
    const theme = useTheme("table", tableCss, pTheme);
    return useObserver(() => {
        const {bottomRow, displayedData, getDomRef, i18nPrefix, itemKey, store} = useListBase(baseProps);

        /** Ligne de table. */
        const TableLine = React.useMemo(
            () =>
                React.forwardRef<HTMLTableRowElement, {data: T}>(({data}, ref) =>
                    useObserver(() => (
                        <tr
                            ref={ref}
                            className={classNames(
                                lineClassName ? lineClassName(data) : "",
                                onLineClick ? theme.clickable() : ""
                            )}
                        >
                            {columns.map(({className, content}, idx) => (
                                <td
                                    className={className}
                                    key={idx}
                                    onClick={() => (onLineClick ? onLineClick(data) : undefined)}
                                >
                                    {content(data)}
                                </td>
                            ))}
                        </tr>
                    ))
                ),
            []
        );

        return (
            <>
                <table className={theme.table()}>
                    <thead>
                        <tr>
                            {columns.map(({title, sortKey}) => (
                                <th key={title}>
                                    {store ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                marginBottom: sortKey ? -3 : 0
                                            }}
                                        >
                                            <div>{i18next.t(title)}</div>
                                            {sortKey ? (
                                                <div style={{marginLeft: 3, display: "flex"}}>
                                                    <IconButton
                                                        disabled={store.sortAsc && store.sortBy === sortKey}
                                                        onClick={action(() => {
                                                            store.sortAsc = true;
                                                            store.sortBy = sortKey;
                                                        })}
                                                        icon={getIcon(`${i18nPrefix}.icons.table.sortAsc`)}
                                                    />
                                                    <IconButton
                                                        disabled={!store.sortAsc && store.sortBy === sortKey}
                                                        onClick={action(() => {
                                                            store.sortAsc = false;
                                                            store.sortBy = sortKey;
                                                        })}
                                                        icon={getIcon(`${i18nPrefix}.icons.table.sortDesc`)}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : (
                                        i18next.t(title)
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayedData.map((item, idx) => (
                            <TableLine ref={getDomRef(idx)} key={itemKey(item, idx)} data={item} />
                        ))}
                    </tbody>
                </table>
                {bottomRow}
            </>
        );
    });
}

/**
 * Crée un composant de tableau standard.
 * @param props Les props du tableau.
 */
export function tableFor<T>(props: TableProps<T>) {
    return <Table<T> {...props} />;
}
