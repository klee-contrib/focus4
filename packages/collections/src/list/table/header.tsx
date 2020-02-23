import i18next from "i18next";
import {action} from "mobx";
import * as React from "react";

import {ListStoreBase} from "@focus4/stores";
import {getIcon, ToBem} from "@focus4/styling";
import {FontIcon} from "@focus4/toolbox";

import {TableCss} from "../__style__/table.css";

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

export function TableHeader<T>({
    column: {title, sortKey},
    i18nPrefix,
    store,
    theme
}: {
    column: TableColumn<T>;
    i18nPrefix: string;
    store?: ListStoreBase<T>;
    theme: ToBem<TableCss>;
}) {
    return (
        <th>
            <div
                className={store && sortKey ? theme.sortable() : undefined}
                onClick={
                    (store &&
                        sortKey &&
                        action(() => {
                            store.sortAsc = store.sortBy !== sortKey ? true : !store.sortAsc;
                            store.sortBy = sortKey;
                        })) ||
                    undefined
                }
            >
                {store && sortKey && store.sortBy === sortKey ? (
                    <FontIcon icon={getIcon(`${i18nPrefix}.icons.table.sort${store.sortAsc ? "Desc" : "Asc"}`)} />
                ) : null}
                {i18next.t(title)}
            </div>
        </th>
    );
}
