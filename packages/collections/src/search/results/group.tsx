import i18next from "i18next";
import {ObservableMap} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {ComponentType, useContext} from "react";

import {ScrollableContext} from "@focus4/layout";
import {CollectionStore, GroupResult} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox, IconButton} from "@focus4/toolbox";

import {ActionBar, List, ListBaseProps, ListProps, OperationListItem} from "../../list";

import groupCss, {GroupCss} from "../__style__/group.css";
export {groupCss};
export type {GroupCss};

export interface GroupHeaderProps<T> {
    group: GroupResult<T>;
    i18nPrefix?: string;
    openedMap: ObservableMap<string, boolean>;
}

/** Props du composant de groupe. */
export interface GroupProps<T extends object, P extends ListBaseProps<T> = ListProps<T>> {
    /** Constituion du groupe à afficher. */
    group: GroupResult<T>;
    /** Header de groupe personnalisé. */
    GroupHeader?: ComponentType<GroupHeaderProps<T>>;
    /** Actions de groupe. */
    groupOperationList?: OperationListItem<T[]>[];
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Composant de liste. */
    ListComponent?: ComponentType<P & {store: CollectionStore<T>}>;
    /** Props pour le composant de liste. */
    listProps: Omit<
        P,
        "data" | "groupCode" | "hasSelection" | "i18nPrefix" | "isManualFetch" | "showAllHandler" | "store"
    >;
    /** Map des états d'ouverture des groupes.  */
    openedMap: ObservableMap<string, boolean>;
    /** Store contenant la liste. */
    store: CollectionStore<T>;
    /** CSS */
    theme?: CSSProp<GroupCss>;
    /** Utilise des ActionBar comme header de groupe, qui remplacent l'ActionBar générale. */
    useGroupActionBars?: boolean;
}

/** Composant de groupe, affiche une ActionBar (si plusieurs groupes) et une StoreList. */
export function Group<T extends object, P extends ListBaseProps<T> = ListProps<T>>({
    group,
    GroupHeader = DefaultGroupHeader,
    groupOperationList,
    hasSelection,
    i18nPrefix = "focus",
    ListComponent = List,
    listProps,
    openedMap,
    store,
    theme: pTheme,
    useGroupActionBars
}: GroupProps<T, P>) {
    const theme = useTheme("group", groupCss, pTheme);
    const {scrollTo} = useContext(ScrollableContext);
    const state = useLocalObservable(() => ({
        /** Store pour le groupe. */
        get store(): CollectionStore<T> {
            return group.code ? store.getSearchGroupStore(group.code) : store;
        },

        /** Action pour dégrouper et sélectionner la facette correspondant au groupe choisi. */
        showAllHandler() {
            store.addFacetValue(store.groupingKey!, group.code, "selected");
            store.groupingKey = undefined;
            scrollTo({
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
                        <Checkbox
                            indeterminate={state.store.selectionStatus === "partial"}
                            onChange={state.store.toggleAll}
                            theme={{checkbox: theme.selectionToggle()}}
                            value={state.store.selectionStatus !== "none"}
                        />
                    ) : null}
                    <GroupHeader group={group} openedMap={openedMap} />
                </div>
            )}
            {openedMap.get(group.code) ? (
                <ListComponent
                    {...(listProps as P)}
                    {...{hasSelection, hideAdditionalItems: true}}
                    i18nPrefix={i18nPrefix}
                    isManualFetch
                    showAllHandler={group.list.length < group.totalCount ? state.showAllHandler : undefined}
                    store={state.store}
                />
            ) : null}
        </>
    ));
}

export function DefaultGroupHeader<T>({group, i18nPrefix = "focus", openedMap}: GroupHeaderProps<T>) {
    return useObserver(() => {
        const opened = openedMap.get(group.code);
        return (
            <>
                <IconButton
                    icon={{i18nKey: `${i18nPrefix}.icons.facets.${opened ? "close" : "open"}`}}
                    onClick={() => openedMap.set(group.code, !opened)}
                />
                <strong>{`${i18next.t(group.label)} (${group.totalCount})`}</strong>
            </>
        );
    });
}
