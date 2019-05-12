import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {GroupResult, SearchStore} from "@focus4/stores";

import {
    DetailProps,
    DragLayerStyle,
    EmptyProps,
    LineProps,
    LineStyle,
    listFor,
    ListStyle,
    LoadingProps,
    OperationListItem,
    storeListFor
} from "../../list";
import {Group, GroupStyle} from "./group";
export {GroupStyle};

/** Props de Results. */
export interface ResultsProps<T> {
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
    groupTheme?: GroupStyle;
    /** Active le drag and drop. */
    hasDragAndDrop?: boolean;
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Chargement manuel (à la place du scroll infini). */
    isManualFetch?: boolean;
    /** Fonction pour déterminer la key à utiliser pour chaque élément de la liste. */
    itemKey: (item: T, idx: number) => string | number | undefined;
    /** Composant de ligne. */
    LineComponent?: React.ComponentType<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: T) => OperationListItem<T>[];
    /** CSS des lignes. */
    lineTheme?: LineStyle;
    /** Nombre d'éléments affichés par page de liste (pagination locale, indépendante de la recherche). */
    listPageSize?: number;
    /** CSS de la liste. */
    listTheme?: ListStyle;
    /** Composant à afficher pendant le chargement. */
    LoadingComponent?: React.ComponentType<LoadingProps<T>>;
    /** Composant de mosaïque. */
    MosaicComponent?: React.ComponentType<LineProps<T>>;
    /** (Scroll infini) Index de l'item, en partant du bas de la liste affichée, qui charge la page suivante dès qu'il est visible. Par défaut : 5. */
    pageItemIndex?: number;
    /** Store de recherche. */
    store: SearchStore<T>;
    /** Utilise des ActionBar comme header de groupe, qui remplacent l'ActionBar générale. */
    useGroupActionBars?: boolean;
}

/** Composants affichant les résultats de recherche, avec affiche par groupe. */
@observer
export class Results<T> extends React.Component<ResultsProps<T>> {
    /** Props communes entre le composant de liste et ceux de groupes. */
    @computed
    private get commonListProps() {
        const {
            canOpenDetail,
            DetailComponent,
            disableDragAnimThreshold,
            dragItemType,
            dragLayerTheme,
            EmptyComponent,
            hasDragAndDrop,
            hasSelection,
            i18nPrefix,
            isManualFetch,
            itemKey,
            LineComponent,
            lineTheme,
            LoadingComponent,
            MosaicComponent,
            store
        } = this.props;
        return {
            canOpenDetail,
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
            LoadingComponent,
            MosaicComponent,
            isManualFetch,
            itemKey,
            store
        };
    }

    render() {
        const {
            GroupHeader,
            groupOperationList,
            groupPageSize,
            groupPageListSize = 10,
            groupPageItemIndex = 2,
            groupTheme,
            isManualFetch,
            lineOperationList,
            listPageSize,
            listTheme,
            pageItemIndex,
            store,
            useGroupActionBars
        } = this.props;

        const filteredGroups = store.groups.filter(group => group.totalCount !== 0);
        if (filteredGroups.length) {
            return (
                <div data-focus="results">
                    {listFor({
                        data: filteredGroups,
                        itemKey: data => data.code,
                        LineComponent: ({data}) => (
                            <Group
                                {...this.commonListProps}
                                group={data}
                                GroupHeader={GroupHeader}
                                groupOperationList={groupOperationList && groupOperationList(data)}
                                key={data.code}
                                lineOperationList={lineOperationList}
                                listTheme={listTheme}
                                perPage={groupPageSize}
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
                    {storeListFor({
                        ...this.commonListProps,
                        operationList: lineOperationList,
                        pageItemIndex,
                        perPage: listPageSize,
                        theme: listTheme
                    })}
                </div>
            );
        }
    }
}

/**
 * Crée un composant de Results.
 * @param props Les props du Results.
 */
export function resultsFor<T>(props: ResultsProps<T>) {
    return <Results {...props} />;
}
