import {useObserver} from "mobx-react";

import {CollectionStore} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import {ListBaseProps, useListBase} from "../list-base";

import {TableColumn, TableHeader} from "./header";
import {TableLine} from "./line";

import tableCss, {TableCss} from "../__style__/table.css";
export {TableColumn, tableCss, TableCss};

/** Props du tableau de base. */
export type TableProps<T> = ListBaseProps<T> & {
    /** La description des colonnes du tableau. */
    columns: TableColumn<T>[];
    /** Affiche la sélection sur les lignes (store uniquement). */
    hasSelection?: boolean;
    /** Classe CSS pour une ligne. */
    lineClassName?: (data: T) => string;
    /** Appelé au clic sur une ligne. */
    onLineClick?: (data: T) => void;
    /** CSS. */
    theme?: CSSProp<TableCss>;
} & (
        {
              /** Le store contenant la liste. */
              store: CollectionStore<T>;
          } | {
              /** Les données du tableau. */
              data: T[];
          }
    );

/** Tableau standard */
export function Table<T>({
    columns,
    hasSelection,
    lineClassName,
    onLineClick,
    theme: pTheme,
    ...baseProps
}: TableProps<T>) {
    const theme = useTheme("table", tableCss, pTheme);
    return useObserver(() => {
        const {bottomRow, displayedData, getDomRef, i18nPrefix, itemKey, store} = useListBase(baseProps);
        return (
            <>
                <table className={theme.table()}>
                    <thead>
                        <tr>
                            {hasSelection ? <th /> : null}
                            {columns.map(column => (
                                <TableHeader
                                    key={column.title}
                                    column={column}
                                    i18nPrefix={i18nPrefix}
                                    store={store}
                                    theme={theme}
                                />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayedData.map((item, idx) => (
                            <TableLine
                                key={itemKey(item, idx)}
                                className={lineClassName}
                                columns={columns}
                                data={item}
                                domRef={getDomRef(idx)}
                                hasSelection={hasSelection}
                                i18nPrefix={i18nPrefix}
                                onClick={onLineClick}
                                store={store}
                                theme={theme}
                            />
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
