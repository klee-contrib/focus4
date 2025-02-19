import classNames from "classnames";
import i18next from "i18next";
import {action} from "mobx";
import {ReactNode} from "react";

import {CollectionStore} from "@focus4/stores";
import {ToBem} from "@focus4/styling";
import {FontIcon} from "@focus4/toolbox";

import {TableCss} from "../__style__/table.css";

/** Colonne de tableau. */
export interface TableColumn<T extends object> {
    /** Classe CSS pour la colonne (posée sur le <th> et les <td>). */
    className?: string;
    /** Contenu de la colonne. */
    content: (data: T) => ReactNode;
    /** Libellé du titre de la colonne. */
    title: string;
    /** Si la colonne est triable, le nom du champ sur lequel on doit trier. */
    sortKey?: string;
}

export function TableHeader<T extends object>({
    column: {title, className: cellClassName, sortKey},
    i18nPrefix,
    store,
    theme
}: {
    column: TableColumn<T>;
    i18nPrefix: string;
    store?: CollectionStore<T>;
    theme: ToBem<TableCss>;
}) {
    return (
        <th
            className={classNames(
                cellClassName,
                theme.heading({sortable: !!(store && sortKey), sorted: store && !!sortKey && store?.sortBy === sortKey})
            )}
            onClick={
                store && sortKey
                    ? action(() => {
                          store.sortAsc = store.sortBy !== sortKey ? true : !store.sortAsc;
                          store.sortBy = sortKey;
                      })
                    : undefined
            }
        >
            {store && sortKey ? (
                <FontIcon
                    className={theme.sortIcon()}
                    icon={{
                        i18nKey: `${i18nPrefix}.icons.table.sort${
                            store.sortBy !== sortKey || store.sortAsc ? "Asc" : "Desc"
                        }`
                    }}
                />
            ) : null}
            <span className={theme.label()}>{i18next.t(title)}</span>
        </th>
    );
}
