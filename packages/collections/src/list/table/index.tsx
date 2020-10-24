import classNames from "classnames";
import {useLocalStore, useObserver} from "mobx-react";
import * as React from "react";

import {CollectionStore} from "@focus4/stores";
import {CSSProp, getIcon, useTheme} from "@focus4/styling";

import {ListBaseProps, useListBase} from "../list-base";
import {TableColumn, TableHeader} from "./header";

import {IconButton} from "@focus4/toolbox";
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
        | {
              /** Les données du tableau. */
              data: T[];
          }
        | {
              /** Le store contenant la liste. */
              store: CollectionStore<T>;
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

        /** Ligne de table. */
        const TableLine = React.useMemo(
            () =>
                React.forwardRef<HTMLTableRowElement, {data: T}>(({data}, ref) => {
                    const state = useLocalStore(() => ({
                        /** Précise si la checkbox doit être affichée. */
                        get isCheckboxDisplayed() {
                            return !!store?.selectedItems.size || false;
                        },

                        /** Précise si la ligne est sélectionnable. */
                        get isSelectable() {
                            return (hasSelection && store?.isItemSelectionnable(data)) || false;
                        },

                        /** Précise si la ligne est sélectionnée.. */
                        get isSelected() {
                            return store?.selectedItems.has(data) || false;
                        },

                        /** Handler de clic sur la case de sélection. */
                        onSelection() {
                            store?.toggle(data);
                        }
                    }));

                    return useObserver(() => (
                        <tr
                            ref={ref}
                            className={classNames(
                                lineClassName ? lineClassName(data) : "",
                                onLineClick ? theme.clickable() : ""
                            )}
                        >
                            {hasSelection ? (
                                <td className={theme.checkbox({forceDisplay: state.isCheckboxDisplayed})}>
                                    {state.isSelectable ? (
                                        <IconButton
                                            icon={getIcon(
                                                `${i18nPrefix}.icons.line.${state.isSelected ? "" : "un"}selected`
                                            )}
                                            onClick={state.onSelection}
                                            primary={state.isSelected}
                                            theme={{toggle: theme.toggle(), icon: theme.checkboxIcon()}}
                                        />
                                    ) : null}
                                </td>
                            ) : null}
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
                    ));
                }),
            []
        );

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
