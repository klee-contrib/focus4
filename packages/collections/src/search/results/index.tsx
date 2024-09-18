import {comparer, observable, reaction} from "mobx";
import {useObserver} from "mobx-react";
import {ComponentType, useEffect, useState} from "react";

import {CollectionStore, GroupResult} from "@focus4/stores";
import {CSSProp} from "@focus4/styling";

import {List, ListBaseProps, ListProps, OperationListItem} from "../../list";

import {Group, GroupCss, groupCss, GroupHeaderProps} from "./group";
export {Group, GroupCss, groupCss, GroupHeaderProps};

/** Props de Results. */
export interface ResultsProps<T, P extends ListBaseProps<T> = ListProps<T>> {
    /** Groupes pliés par défauts (par groupingKey) */
    defaultFoldedGroups?: Record<string, string[]>;
    /** Header de groupe personnalisé. */
    GroupHeader?: ComponentType<GroupHeaderProps<T>>;
    /** Actions de groupe par groupe (code / valeur). */
    groupOperationList?: (group: GroupResult<T>) => OperationListItem<T[]>[];
    /** Nombre d'éléments affichés par page de groupe. Par défaut : 5. */
    groupPageSize?: number;
    /** Nombre de groupes affichés par page de liste de groupe (pagination locale, indépendante de la recherche). Par défaut: 10. */
    groupPageListSize?: number;
    /** (Scroll infini, affichage en groupe) Index du groupe, en partant du bas de la liste de groupe affichée, qui charge la page suivante dès qu'il est visible. Par défaut : 2. */
    groupPageItemIndex?: number;
    /** CSS des groupes. */
    groupTheme?: CSSProp<GroupCss>;
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Chargement manuel (à la place du scroll infini). */
    isManualFetch?: boolean;
    /** Composant de liste. */
    ListComponent?: ComponentType<P & {store: CollectionStore<T>}>;
    /** Props pour le composant de liste. */
    listProps: Omit<
        P,
        "data" | "groupCode" | "hasSelection" | "i18nPrefix" | "isManualFetch" | "showAllHandler" | "store"
    >;
    /** Store contenant la liste. */
    store: CollectionStore<T>;
    /** Utilise des ActionBar comme header de groupe, qui remplacent l'ActionBar générale. */
    useGroupActionBars?: boolean;
}

/**
 * Ce composant permet d'afficher les résultats de la recherche, sous la forme d'une liste unique ou bien de groupes si on souhaite en afficher.
 *
 * Chaque groupe est muni d'un header qui peut être soit un header simple avec une case de sélection et le nom du groupe, soit une `ActionBar` si on veut gérer des actions spécifiques au niveau du groupe (prop `useGroupActionBars`).
 *
 * Toutes les listes sont des [`listFor`](/docs/listes-composants-de-listes-listfor--list) (par défaut, on peut également utiliser un autre composant de liste) et peuvent donc utiliser toutes leurs fonctionnalités.
 */
export function Results<T, P extends ListBaseProps<T> = ListProps<T>>({
    defaultFoldedGroups,
    GroupHeader,
    groupOperationList,
    groupPageListSize = 10,
    groupPageItemIndex = 2,
    groupPageSize = 5,
    groupTheme,
    hasSelection,
    i18nPrefix,
    isManualFetch,
    listProps,
    ListComponent = List,
    store,
    useGroupActionBars
}: ResultsProps<T, P>) {
    // Map pour contrôler les groupes qui sont ouverts, initialisés une seule fois après le premier chargement du store.
    const [openedMap] = useState(() => observable.map<string, boolean>());

    function toggleAll(opened: boolean, forceDefaults: boolean) {
        if (store.groupingKey) {
            openedMap.replace(
                store.groups.map(group => [
                    group.code,
                    forceDefaults && defaultFoldedGroups?.[store.groupingKey!]?.includes(group.code) ? false : opened
                ])
            );
        }
    }

    useEffect(
        () =>
            reaction(
                () => [store.groupingKey, store.groups.map(f => f.code)],
                () => toggleAll(true, true),
                {
                    equals: comparer.structural,
                    fireImmediately: true
                }
            ),
        [store]
    );

    return useObserver(() => {
        const filteredGroups = store.groups.filter(group => group.totalCount !== 0);
        return (
            <div data-focus="results">
                {filteredGroups.length ? (
                    <List
                        key="result-group-list"
                        data={filteredGroups}
                        isManualFetch={isManualFetch}
                        itemKey={data => data.code}
                        LineComponent={({data}) => (
                            <Group
                                key={data.code}
                                group={data}
                                GroupHeader={GroupHeader}
                                groupOperationList={groupOperationList?.(data)}
                                hasSelection={hasSelection}
                                i18nPrefix={i18nPrefix}
                                ListComponent={ListComponent}
                                listProps={{...listProps, perPage: groupPageSize}}
                                openedMap={openedMap}
                                store={store}
                                theme={groupTheme}
                                useGroupActionBars={useGroupActionBars}
                            />
                        )}
                        mode="list"
                        pageItemIndex={groupPageItemIndex}
                        perPage={groupPageListSize}
                    />
                ) : (
                    <ListComponent
                        key="result-list"
                        {...(listProps as P)}
                        {...{hasSelection}}
                        i18nPrefix={i18nPrefix}
                        isManualFetch={isManualFetch}
                        store={store}
                    />
                )}
            </div>
        );
    });
}
