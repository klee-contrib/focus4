import {useObserver} from "mobx-react";
import {ComponentType} from "react";

import {CollectionStore, GroupResult} from "@focus4/stores";
import {CSSProp} from "@focus4/styling";

import {List, ListBaseProps, ListProps, OperationListItem} from "../../list";
import {Group, GroupCss, groupCss} from "./group";
export {Group, GroupCss, groupCss};

/** Props de Results. */
export interface ResultsProps<T, P extends ListBaseProps<T> = ListProps<T>> {
    /** Header de groupe personnalisé. */
    GroupHeader?: ComponentType<{group: GroupResult<T>}>;
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

/** Composants affichant les résultats de recherche, avec affiche par groupe. */
export function Results<T, P extends ListBaseProps<T> = ListProps<T>>({
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
    return useObserver(() => {
        const filteredGroups = store.groups.filter(group => group.totalCount !== 0);
        return (
            <div data-focus="results">
                {filteredGroups.length ? (
                    <List
                        key="result-group-list"
                        data={filteredGroups}
                        itemKey={data => data.code}
                        LineComponent={({data}) => (
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
                        )}
                        mode="list"
                        isManualFetch={isManualFetch}
                        perPage={groupPageListSize}
                        pageItemIndex={groupPageItemIndex}
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
