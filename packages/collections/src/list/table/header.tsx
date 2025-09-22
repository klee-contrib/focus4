import classNames from "classnames";
import {action} from "mobx";
import {useObserver} from "mobx-react";
import {ReactNode, useCallback} from "react";
import {useTranslation} from "react-i18next";

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
    /** Si la colonne est triable, le nom du champ sur lequel on doit trier. */
    sortKey?: string;
    /** Libellé du titre de la colonne. */
    title: string;
}

export function TableHeader<T extends object>({
    column: {title, className: cellClassName, sortKey},
    i18nPrefix,
    maxSort,
    store,
    theme
}: {
    column: TableColumn<T>;
    i18nPrefix: string;
    maxSort: number;
    store?: CollectionStore<T>;
    theme: ToBem<TableCss>;
}) {
    const {t} = useTranslation();

    const onSort = useCallback(
        action(() => {
            if (store && sortKey && maxSort > 0) {
                if (!store.sort.some(({fieldName}) => fieldName === sortKey)) {
                    while (store.sort.length >= maxSort) {
                        store.sort.pop();
                    }
                    store.sort.push({fieldName: sortKey});
                } else {
                    const sort = store.sort.find(({fieldName}) => fieldName === sortKey)!;
                    if (!sort.sortDesc) {
                        sort.sortDesc = true;
                    } else {
                        store.sort = store.sort.filter(({fieldName}) => fieldName !== sortKey);
                    }
                }
            }
        }),
        [maxSort, sortKey, store]
    );

    return useObserver(() => {
        const sortable = !!(store && store.totalCount > 0 && sortKey);
        return (
            <th
                className={classNames(
                    cellClassName,
                    theme.heading({
                        sortable,
                        sorted: sortable && store.sort.some(({fieldName}) => fieldName === sortKey),
                        multipleSort: maxSort > 1
                    })
                )}
                onClick={sortable ? onSort : undefined}
                tabIndex={sortable ? 0 : undefined}
                onKeyDown={e => {
                    if (e.code === "Space") {
                        e.preventDefault();
                    }
                }}
                onKeyUp={e => {
                    if (e.code === "Space") {
                        onSort();
                    }
                }}
            >
                {sortable && maxSort > 1 ? (
                    <span className={theme.sortCount()}>{store.sort.findIndex(s => s.fieldName === sortKey) + 1}</span>
                ) : null}
                {sortable ? (
                    <FontIcon
                        className={theme.sortIcon()}
                        icon={{
                            i18nKey: `${i18nPrefix}.icons.table.sort${
                                store.sort.length === 0 ||
                                !store.sort.some(({fieldName}) => fieldName === sortKey) ||
                                !store.sort.find(({fieldName}) => fieldName === sortKey)!.sortDesc
                                    ? "Asc"
                                    : "Desc"
                            }`
                        }}
                    />
                ) : null}
                <span className={theme.label()}>{t(title)}</span>
            </th>
        );
    });
}
