import classNames from "classnames";
import {useObserver} from "mobx-react";
import * as React from "react";

import {ListStoreBase} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import {ListBaseProps, useListBase} from "../list-base";
import {TableColumn, TableHeader} from "./header";

import tableCss, {TableCss} from "../__style__/table.css";
export {TableColumn, tableCss, TableCss};

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
                            {columns.map(column => (
                                <TableHeader column={column} i18nPrefix={i18nPrefix} store={store} theme={theme} />
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
