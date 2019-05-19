import i18next from "i18next";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {IconButton} from "react-toolbox/lib/button";

import {getIcon} from "@focus4/components";
import {GroupResult, ListStoreBase, SearchStore} from "@focus4/stores";
import {themr} from "@focus4/styling";

import {
    ActionBar,
    DetailProps,
    DragLayerStyle,
    EmptyProps,
    LineProps,
    LineStyle,
    ListStyle,
    LoadingProps,
    OperationListItem,
    storeListFor
} from "../../list";

import groupStyles from "../__style__/group.css";
export {groupStyles};
export type GroupStyle = Partial<typeof groupStyles>;
const Theme = themr("group", groupStyles);

/** Props du composant de groupe. */
export interface GroupProps<T> {
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data: T) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: React.ComponentType<DetailProps<T>>;
    /** Nombre d'éléments à partir du quel on n'affiche plus d'animation de drag and drop sur les lignes. */
    disableDragAnimThreshold?: number;
    /** Type de l'item de liste pour le drag and drop. Par défaut : "item". */
    dragItemType?: string;
    /** CSS du DragLayer. */
    dragLayerTheme?: DragLayerStyle;
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: React.ComponentType<EmptyProps<T>>;
    /** Constituion du groupe à afficher. */
    group: GroupResult<T>;
    /** Header de groupe personnalisé. */
    GroupHeader?: React.ComponentType<{group: GroupResult<T>}>;
    /** Actions de groupe. */
    groupOperationList?: OperationListItem<T[]>[];
    /** Active le drag and drop. */
    hasDragAndDrop?: boolean;
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Fonction pour déterminer la key à utiliser pour chaque élément de la liste. */
    itemKey: (item: T, idx: number) => string | number | undefined;
    /** Composant de ligne. */
    LineComponent?: React.ComponentType<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: T) => OperationListItem<T>[];
    /** CSS des lignes. */
    lineTheme?: LineStyle;
    /** CSS de la liste. */
    listTheme?: ListStyle;
    /** Composant à afficher pendant le chargement. */
    LoadingComponent?: React.ComponentType<LoadingProps<T>>;
    /** Composant de mosaïque. */
    MosaicComponent?: React.ComponentType<LineProps<T>>;
    /** Nombre d'éléments par page. Par défaut : 5. */
    perPage?: number;
    /** Store contenant la liste. */
    store: SearchStore<T>;
    /** CSS */
    theme?: GroupStyle;
    /** Utilise des ActionBar comme header de groupe, qui remplacent l'ActionBar générale. */
    useGroupActionBars?: boolean;
}

/** Composant de groupe, affiche une ActionBar (si plusieurs groupes) et une StoreList. */
@observer
export class Group<T> extends React.Component<GroupProps<T>> {
    @computed
    protected get store(): ListStoreBase<T> {
        const {group, store} = this.props;
        return group.code ? store.getSearchGroupStore(group.code) : store;
    }

    /** Action pour dégrouper et sélectionner la facette correspondant au groupe choisi. */
    @action.bound
    protected showAllHandler() {
        const {groupingKey, selectedFacets, setProperties} = this.props.store;
        setProperties({
            groupingKey: undefined,
            selectedFacets: {...selectedFacets, [groupingKey!]: [this.props.group.code]}
        });
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    render() {
        const {
            canOpenDetail,
            DetailComponent,
            disableDragAnimThreshold,
            dragItemType,
            dragLayerTheme,
            EmptyComponent,
            group,
            GroupHeader = DefaultGroupHeader,
            groupOperationList,
            hasDragAndDrop,
            hasSelection,
            i18nPrefix = "focus",
            itemKey,
            LineComponent,
            lineOperationList,
            lineTheme,
            listTheme,
            LoadingComponent,
            MosaicComponent,
            perPage = 5,
            useGroupActionBars
        } = this.props;
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <>
                        {useGroupActionBars ? (
                            <ActionBar
                                group={{code: group.code, label: group.label, totalCount: group.totalCount}}
                                hasSelection={hasSelection}
                                operationList={groupOperationList}
                                store={this.store}
                            />
                        ) : (
                            <div className={theme.header}>
                                {hasSelection ? (
                                    <IconButton
                                        icon={getIcon(`${i18nPrefix}.icons.actionBar.${this.store.selectionStatus}`)}
                                        onClick={this.store.toggleAll}
                                        theme={{toggle: theme.selectionToggle, icon: theme.selectionIcon}}
                                    />
                                ) : null}
                                <GroupHeader group={group} />
                            </div>
                        )}
                        {storeListFor({
                            canOpenDetail,
                            DetailComponent,
                            disableDragAnimThreshold,
                            dragItemType,
                            dragLayerTheme,
                            EmptyComponent,
                            groupCode: group.code,
                            hasDragAndDrop,
                            hasSelection,
                            hideAdditionalItems: true,
                            i18nPrefix,
                            isManualFetch: true,
                            itemKey,
                            LineComponent,
                            lineTheme,
                            LoadingComponent,
                            MosaicComponent,
                            operationList: lineOperationList,
                            perPage,
                            showAllHandler: group.list.length < group.totalCount ? this.showAllHandler : undefined,
                            store: this.store,
                            theme: listTheme
                        })}
                    </>
                )}
            </Theme>
        );
    }
}

export function DefaultGroupHeader({group}: {group: GroupResult}) {
    return <strong>{`${i18next.t(group.label)} (${group.totalCount})`}</strong>;
}

/**
 * Crée un composant de groupe.
 * @param props Les props du groupe.
 */
export function groupFor<T>(props: GroupProps<T>) {
    return <Group {...props} />;
}
