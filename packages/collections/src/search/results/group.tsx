import i18next from "i18next";
import {useLocalStore, useObserver} from "mobx-react";
import * as React from "react";

import {CollectionStore, GroupResult} from "@focus4/stores";
import {CSSProp, getIcon, ScrollableContext, useTheme} from "@focus4/styling";
import {IconButton} from "@focus4/toolbox";

import {ActionBar, List, ListBaseProps, ListProps, OperationListItem} from "../../list";

import groupCss, {GroupCss} from "../__style__/group.css";
export {groupCss, GroupCss};

/** Props du composant de groupe. */
export interface GroupProps<T, P extends ListBaseProps<T> = ListProps<T>> {
    /** Constituion du groupe à afficher. */
    group: GroupResult<T>;
    /** Header de groupe personnalisé. */
    GroupHeader?: React.ComponentType<{group: GroupResult<T>}>;
    /** Actions de groupe. */
    groupOperationList?: OperationListItem<T[]>[];
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Composant de liste. */
    ListComponent?: React.ComponentType<P & {store: CollectionStore<T>}>;
    /** Props pour le composant de liste. */
    listProps: Omit<
        P,
        "data" | "groupCode" | "hasSelection" | "i18nPrefix" | "isManualFetch" | "showAllHandler" | "store"
    >;
    /** Store contenant la liste. */
    store: CollectionStore<T>;
    /** CSS */
    theme?: CSSProp<GroupCss>;
    /** Utilise des ActionBar comme header de groupe, qui remplacent l'ActionBar générale. */
    useGroupActionBars?: boolean;
}

/** Composant de groupe, affiche une ActionBar (si plusieurs groupes) et une StoreList. */
export function Group<T, P extends ListBaseProps<T> = ListProps<T>>({
    group,
    GroupHeader = DefaultGroupHeader,
    groupOperationList,
    hasSelection,
    i18nPrefix = "focus",
    ListComponent = List,
    listProps,
    store,
    theme: pTheme,
    useGroupActionBars
}: GroupProps<T, P>) {
    const theme = useTheme("group", groupCss, pTheme);
    const context = React.useContext(ScrollableContext);
    const state = useLocalStore(() => ({
        /** Store pour le groupe. */
        get store(): CollectionStore<T> {
            return group.code ? store.getSearchGroupStore(group.code) : store;
        },

        /** Action pour dégrouper et sélectionner la facette correspondant au groupe choisi. */
        showAllHandler() {
            const {groupingKey, selectedFacets, setProperties} = store;
            setProperties({
                groupingKey: undefined,
                selectedFacets: {...selectedFacets, [groupingKey!]: [group.code]}
            });
            context.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }));

    return useObserver(() => (
        <>
            {useGroupActionBars ? (
                <ActionBar
                    group={{code: group.code, label: group.label, totalCount: group.totalCount}}
                    hasSelection={hasSelection}
                    operationList={groupOperationList}
                    store={state.store}
                />
            ) : (
                <div className={theme.header()}>
                    {hasSelection ? (
                        <IconButton
                            icon={getIcon(`${i18nPrefix}.icons.actionBar.${state.store.selectionStatus}`)}
                            onClick={state.store.toggleAll}
                            theme={{toggle: theme.selectionToggle(), icon: theme.selectionIcon()}}
                        />
                    ) : null}
                    <GroupHeader group={group} />
                </div>
            )}
            <ListComponent
                {...(listProps as P)}
                {...{hasSelection, hideAdditionalItems: true}}
                i18nPrefix={i18nPrefix}
                isManualFetch
                showAllHandler={group.list.length < group.totalCount ? state.showAllHandler : undefined}
                store={state.store}
            />
        </>
    ));
}

export function DefaultGroupHeader({group}: {group: GroupResult}) {
    return <strong>{`${i18next.t(group.label)} (${group.totalCount})`}</strong>;
}
