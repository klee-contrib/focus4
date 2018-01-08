import {autobind} from "core-decorators";
import i18next from "i18next";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";
import {Button} from "react-toolbox/lib/button";

import {getIcon} from "../../../../components";
import {ReactComponent} from "../../../../config";
import {DetailProps, DragLayerStyle, EmptyProps, LineProps, LineStyle, ListStyle, OperationListItem, StoreList} from "../../list";

import {GroupResult, SearchStore} from "../../../store";
import Group, {GroupLoadingBar, GroupStyle} from "./group";
export {GroupStyle};

import {bottomRow} from "../../list/__style__/list.css";

/** Props de Results. */
export interface ResultsProps<T> {
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data: T) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: ReactComponent<DetailProps<T>>;
    /** Hauteur du composant de détail. Par défaut : 200. */
    detailHeight?: number | ((data: T) => number);
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
    /** Nombre d'éléments affichés par page de groupe. Par défaut: 5 */
    groupPageSize?: number;
    /** CSS des groupes. */
    groupTheme?: GroupStyle;
    /** Active le drag and drop. */
    hasDragAndDrop?: boolean;
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Précise si chaque élément est sélectionnable ou non. Par défaut () => true. */
    isLineSelectionnable?: (data: T) => boolean;
    /** Chargement manuel (à la place du scroll infini). */
    isManualFetch?: boolean;
    /** Composant de ligne. */
    LineComponent?: ReactComponent<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: T) => OperationListItem<T>[];
    /** CSS des lignes. */
    lineTheme?: LineStyle;
    /** CSS de la liste. */
    listTheme?: ListStyle;
    /** Composant de mosaïque. */
    MosaicComponent?: ReactComponent<LineProps<T>>;
    /** Offset pour le scroll inifini. Par défaut : 250 */
    offset?: number;
    /** Store de recherche. */
    store: SearchStore<T>;
    /** Utilise des ActionBar comme header de groupe, qui remplacent l'ActionBar générale. */
    useGroupActionBars?: boolean;
}

/** Composants affichant les résultats de recherche, avec affiche par groupe. */
@autobind
@observer
export class Results<T> extends React.Component<ResultsProps<T>, void> {

    componentDidMount() {
        window.addEventListener("scroll", this.scrollListener);
        window.addEventListener("resize", this.scrollListener);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollListener);
        window.removeEventListener("resize", this.scrollListener);
    }

    /** Gère le scroll infini. */
    protected scrollListener() {
        const {store, offset = 250, isManualFetch} = this.props;
        if (!isManualFetch && store.currentCount < store.totalCount && !store.groupingKey) {
            const el = findDOMNode(this) as HTMLElement;
            const scrollTop = window.pageYOffset;
            if (el && topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight) < offset) {
                if (!store.isLoading) {
                    store.search(true);
                }
            }
        }
    }

    /** Bouton permettant de lancer la recherche des résultats suivants, si on n'est pas en scroll infini. */
    protected get showMoreButton() {
        const {store, isManualFetch, i18nPrefix = "focus"} = this.props;
        if (isManualFetch && store.currentCount < store.totalCount && !store.groupingKey) {
            return (
                <div className={bottomRow}>
                    <Button
                        onClick={() => !store.isLoading && store.search(true)}
                        icon={getIcon(`${i18nPrefix}.icons.list.add`)}
                        label={`${i18next.t(`${i18nPrefix}.list.show.more`)}`}
                    />
                </div>
            );
        }

        return null;
    }

    /** Props communes entre le composant de liste et ceux de groupes. */
    @computed
    private get commonListProps() {
        const {canOpenDetail, detailHeight, DetailComponent, dragItemType, dragLayerTheme, EmptyComponent, hasDragAndDrop, hasSelection, i18nPrefix, LineComponent, lineTheme, MosaicComponent, isLineSelectionnable, store} = this.props;
        return {
            canOpenDetail,
            detailHeight,
            DetailComponent,
            dragItemType,
            dragLayerTheme,
            EmptyComponent,
            hasDragAndDrop,
            hasSelection,
            i18nPrefix,
            LineComponent,
            lineTheme,
            MosaicComponent,
            isLineSelectionnable,
            store
        };
    }

    render() {
        const {GroupHeader, groupOperationList, groupTheme, groupPageSize = 5, i18nPrefix, lineOperationList, listTheme, store, useGroupActionBars} = this.props;
        const {groups, list} = store;

        const filteredGroups = groups.filter(group => group.totalCount !== 0);
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
        }

        if (list.length) {
            return (
                <div data-focus="results">
                    <StoreList
                        {...this.commonListProps}
                        operationList={lineOperationList}
                        theme={listTheme}
                    />
                    <GroupLoadingBar i18nPrefix={i18nPrefix} store={store} />
                    {this.showMoreButton}
                </div>
            );
        }

        return null;
    }
}

export default Results;

function topOfElement(element: HTMLElement): number {
    if (!element) {
        return 0;
    }
    return element.offsetTop + topOfElement((element.offsetParent as HTMLElement));
}
