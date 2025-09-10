import {comparer, observable, reaction} from "mobx";
import {useObserver} from "mobx-react";
import {ComponentType, useEffect, useRef, useState} from "react";

import {useStickyClip} from "@focus4/layout";
import {CollectionStore, GroupResult} from "@focus4/stores";
import {CSSProp} from "@focus4/styling";

import {List, ListBaseProps, ListProps, OperationListItem} from "../../list";

import {Group, GroupCss, groupCss, GroupHeaderProps} from "./group";

export {Group, groupCss};
export type {GroupCss, GroupHeaderProps};

/** Props de Results. */
export interface ResultsProps<T extends object, P extends ListBaseProps<T> = ListProps<T>> {
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
    /**
     * Index du groupe en partant du bas de page courante qui chargera, dès qu'il sera visible à l'écran, la page suivante (en pagination `"single-auto"`).
     *
     * Par défaut : 2.
     */
    groupSentinelItemIndex?: number;
    /** CSS des groupes. */
    groupTheme?: CSSProp<GroupCss>;
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Composant de liste. */
    ListComponent?: ComponentType<P & {store: CollectionStore<T>}>;
    /** Props pour le composant de liste. */
    listProps: Omit<
        P,
        "data" | "groupCode" | "hasSelection" | "i18nPrefix" | "paginationMode" | "showAllHandler" | "store"
    >;
    /**
     * Mode de pagination :
     * - `"single-auto"` (par défaut) : Le contenu de la page suivante s'affichera automatiquement à la suite de la page courante, une fois que l'élement sentinelle (déterminé par `sentinelItemIndex`) sera visible à l'écran.
     * - `"single-manual"` : Le contenu de la page suivante s'affichera à la suite de la page courante, via un bouton "Voir plus" dédié.
     * - `"multiple"` : Le contenu de la page suivante remplacera le contenu de la page courante. La navigation entre les pages se fera via des boutons de navigation dédiés.
     */
    paginationMode?: "multiple" | "single-auto" | "single-manual";
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
export function Results<T extends object, P extends ListBaseProps<T> = ListProps<T>>({
    defaultFoldedGroups,
    GroupHeader,
    groupOperationList,
    groupPageListSize = 10,
    groupPageSize = 5,
    groupSentinelItemIndex = 2,
    groupTheme,
    hasSelection,
    i18nPrefix,
    listProps,
    ListComponent = List,
    paginationMode = "single-auto",
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

    const ref = useRef<HTMLDivElement>(null);
    useStickyClip(ref);

    return useObserver(() => {
        const filteredGroups = store.groups.filter(group => group.totalCount !== 0);
        return (
            <div ref={ref} data-focus="results">
                {filteredGroups.length ? (
                    <List
                        key="result-group-list"
                        data={filteredGroups}
                        paginationMode={paginationMode}
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
                        perPage={groupPageListSize}
                        sentinelItemIndex={groupSentinelItemIndex}
                    />
                ) : (
                    <ListComponent
                        key="result-list"
                        {...(listProps as P)}
                        {...{hasSelection}}
                        i18nPrefix={i18nPrefix}
                        paginationMode={paginationMode}
                        store={store}
                    />
                )}
            </div>
        );
    });
}
