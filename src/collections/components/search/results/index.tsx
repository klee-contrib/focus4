import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {ReactComponent} from "../../../../config";
import {DetailProps, DragLayerStyle, EmptyProps, LineProps, LineStyle, ListStyle, OperationListItem, StoreList} from "../../list";

import {GroupResult, SearchStore} from "../../../store";
import Group, {GroupLoadingBar, GroupStyle} from "./group";
export {GroupStyle};

/** Props de Results. */
export interface ResultsProps<T> {
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data: T) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: ReactComponent<DetailProps<T>>;
    /** Hauteur du composant de détail. Par défaut : 200. */
    detailHeight?: number | ((data: T) => number);
    /** Nombre d'éléments à partir du quel on n'affiche plus d'animation de drag and drop sur les lignes. */
    disableDragAnimThreshold?: number;
    /** Type de l'item de liste pour le drag and drop. Par défaut : "item". */
    dragItemType?: string;
    /** CSS du DragLayer. */
    dragLayerTheme?: DragLayerStyle;
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ReactComponent<EmptyProps<T>>;
    /** Header de groupe personnalisé. */
    GroupHeader?: ReactComponent<{group: GroupResult<T>}>;
    /** Actions de groupe par groupe (code / valeur). */
    groupOperationList?: (group: GroupResult<T>) => OperationListItem<T[]>[];
    /** Nombre d'éléments affichés par page de groupe. Par défaut : 5. */
    groupPageSize?: number;
    /** CSS des groupes. */
    groupTheme?: GroupStyle;
    /** Active le drag and drop. */
    hasDragAndDrop?: boolean;
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Chargement manuel (à la place du scroll infini). */
    isManualFetch?: boolean;
    /** Champ de l'objet à utiliser pour la key des lignes. */
    itemKey?: keyof T;
    /** Composant de ligne. */
    LineComponent?: ReactComponent<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: T) => OperationListItem<T>[];
    /** CSS des lignes. */
    lineTheme?: LineStyle;
    /** Nombre d'éléments affichés par page de liste (pagination locale, indépendante de la recherche). */
    listPageSize?: number;
    /** CSS de la liste. */
    listTheme?: ListStyle;
    /** Composant de mosaïque. */
    MosaicComponent?: ReactComponent<LineProps<T>>;
    /** Offset pour le scroll infini. Par défaut : 250 */
    offset?: number;
    /** Store de recherche. */
    store: SearchStore<T>;
    /** Utilise des ActionBar comme header de groupe, qui remplacent l'ActionBar générale. */
    useGroupActionBars?: boolean;
}

/** Composants affichant les résultats de recherche, avec affiche par groupe. */
@observer
export class Results<T> extends React.Component<ResultsProps<T>, void> {

    /** Props communes entre le composant de liste et ceux de groupes. */
    @computed
    private get commonListProps() {
        const {canOpenDetail, detailHeight, DetailComponent, disableDragAnimThreshold, dragItemType, dragLayerTheme, EmptyComponent, hasDragAndDrop, hasSelection, i18nPrefix, isManualFetch, itemKey, LineComponent, lineTheme, MosaicComponent, store} = this.props;
        return {
            canOpenDetail,
            detailHeight,
            DetailComponent,
            disableDragAnimThreshold,
            dragItemType,
            dragLayerTheme,
            EmptyComponent,
            hasDragAndDrop,
            hasSelection,
            i18nPrefix,
            LineComponent,
            lineTheme,
            MosaicComponent,
            isManualFetch,
            itemKey,
            store
        };
    }

    render() {
        const {GroupHeader, groupOperationList, groupPageSize, groupTheme, i18nPrefix, lineOperationList, listPageSize, listTheme, offset, store, useGroupActionBars} = this.props;

        const filteredGroups = store.groups.filter(group => group.totalCount !== 0);
        if (filteredGroups.length) {
            return (
                <div data-focus="results">
                    {filteredGroups.map(group => (
                        <Group
                            {...this.commonListProps}
                            group={group}
                            GroupHeader={GroupHeader}
                            groupOperationList={groupOperationList && groupOperationList(group)}
                            key={group.code}
                            lineOperationList={lineOperationList}
                            listTheme={listTheme}
                            perPage={groupPageSize}
                            theme={groupTheme}
                            useGroupActionBars={useGroupActionBars}
                        />
                    ))}
                </div>
            );
        } else {
            return (
                <div data-focus="results">
                    <StoreList
                        {...this.commonListProps}
                        operationList={lineOperationList}
                        offset={offset}
                        perPage={listPageSize}
                        theme={listTheme}
                    />
                    <GroupLoadingBar i18nPrefix={i18nPrefix} store={store} />
                </div>
            );
        }
    }
}

export default Results;

/**
 * Crée un composant de Results.
 * @param props Les props du Results.
 */
export function resultsFor<T>(props: ResultsProps<T>) {
    const R = Results as any;
    return <R {...props} />;
}
