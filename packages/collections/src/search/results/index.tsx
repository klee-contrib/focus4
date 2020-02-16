import {useObserver} from "mobx-react-lite";
import * as React from "react";

import {GroupResult, ListStoreBase, SearchStore} from "@focus4/stores";
import {CSSProp} from "@focus4/styling";

import {List, ListBaseProps, listFor, OperationListItem} from "../../list";
import {Group, GroupCss, groupCss} from "./group";
export {Group, GroupCss, groupCss};

/** Props de Results. */
export interface ResultsProps<T, P extends ListBaseProps<T> = ListBaseProps<T>> {
    /** Header de groupe personnalisé. */
    GroupHeader?: React.ComponentType<{group: GroupResult<T>}>;
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
    ListComponent?: React.ComponentType<P & {store: ListStoreBase<T>}>;
    /** Props pour le composant de liste. */
    listProps: Omit<
        P,
        "data" | "groupCode" | "hasSelection" | "i18nPrefix" | "isManualFetch" | "showAllHandler" | "store"
    >;
    /** Store contenant la liste. */
    store: SearchStore<T>;
    /** Utilise des ActionBar comme header de groupe, qui remplacent l'ActionBar générale. */
    useGroupActionBars?: boolean;
}

/** Composants affichant les résultats de recherche, avec affiche par groupe. */
export function Results<T>({
    GroupHeader,
    groupOperationList,
    groupPageListSize = 10,
    groupPageItemIndex = 2,
    groupPageSize,
    groupTheme,
    hasSelection,
    i18nPrefix,
    isManualFetch,
    listProps,
    ListComponent = List as React.ComponentType<ListBaseProps<T> & {store: ListStoreBase<T>}>,
    store,
    useGroupActionBars
}: ResultsProps<T>) {
    return useObserver(() => {
        const filteredGroups = store.groups.filter(group => group.totalCount !== 0);
        if (filteredGroups.length) {
            return (
                <div data-focus="results">
                    {listFor({
                        data: filteredGroups,
                        itemKey: data => data.code,
                        LineComponent: ({data}) => (
                            <Group
                                key={data.code}
                                group={data}
                                GroupHeader={GroupHeader}
                                groupOperationList={groupOperationList && groupOperationList(data)}
                                hasSelection={hasSelection}
                                i18nPrefix={i18nPrefix}
                                ListComponent={ListComponent}
                                listProps={{...listProps, perPage: groupPageSize}}
                                store={store}
                                theme={groupTheme}
                                useGroupActionBars={useGroupActionBars}
                            />
                        ),
                        isManualFetch,
                        perPage: groupPageListSize,
                        pageItemIndex: groupPageItemIndex
                    })}
                </div>
            );
        } else {
            return (
                <div data-focus="results">
                    <ListComponent
                        {...listProps}
                        {...{hasSelection}}
                        i18nPrefix={i18nPrefix}
                        isManualFetch={isManualFetch}
                        store={store}
                    />
                </div>
            );
        }
    });
}

/**
 * Crée un composant de Results.
 * @param props Les props du Results.
 */
export function resultsFor<T>(props: ResultsProps<T>) {
    return <Results {...props} />;
}
