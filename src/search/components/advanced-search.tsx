import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ButtonBackToTop} from "../../components";
import {ReactComponent} from "../../config";
import {DetailProps, DragLayerStyle, EmptyProps, GroupOperationListItem, LineOperationListItem, LineProps, LineStyle, ListStyle, ListWrapper} from "../../list";

import {SearchStore} from "../store";
import {GroupResult} from "../types";
import ActionBar, {ActionBarStyle} from "./action-bar";
import FacetBox, {FacetBoxStyle} from "./facet-box";
import Results, {GroupStyle} from "./results";
import Summary, {SummaryStyle} from "./summary";

import * as styles from "./__style__/advanced-search.css";

export type AdvancedSearchStyle = Partial<typeof styles>;

/** Props de l'AdvancedSearch. */
export interface AdvancedSearchProps<T> {
    /** CSS de l'ActionBar. */
    actionBarTheme?: ActionBarStyle;
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data: T) => boolean;
    /** Permet de supprimer le tri. Par défaut : true */
    canRemoveSort?: boolean;
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
    /** Emplacement de la FacetBox. Par défaut : "left" */
    facetBoxPosition?: "action-bar" | "left" | "none";
    /** CSS de la FacetBox (si position = "left") */
    facetBoxTheme?: FacetBoxStyle;
    /** Actions de groupe par scope. */
    groupOperationList?: (group: GroupResult<T>) => GroupOperationListItem<T>[];
    /** CSS des groupes. */
    groupTheme?: GroupStyle;
    /** Ajoute un bouton de retour en haut de page. Par défault: true */
    hasBackToTop?: boolean;
    /** Active le drag and drop. */
    hasDragAndDrop?: boolean;
    /** Affiche le bouton de groupe dans l'ActionBar. */
    hasGrouping?: boolean;
    /** Affiche la barre de recherche dans l'ActionBar. */
    hasSearchBar?: boolean;
    /** Autorise la sélection. */
    hasSelection?: boolean;
    /** Masque les critères de recherche dans le Summary. */
    hideSummaryCriteria?: boolean;
    /** Masque les facettes dans le Summary. */
    hideSummaryFacets?: boolean;
    /** Masque le groupe dans le Summary. */
    hideSummaryGroup?: boolean;
    /** Masque le tri dans le Summary. */
    hideSummarySort?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Précise si chaque élément est sélectionnable ou non. Par défaut () => true. */
    isLineSelectionnable?: (data: T) => boolean;
    /** Chargement manuel (à la place du scroll infini). */
    isManualFetch?: boolean;
    /** Composant de ligne. */
    LineComponent?: ReactComponent<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: T) => LineOperationListItem<T>[];
    /** CSS des lignes. */
    lineTheme?: LineStyle;
    /** CSS de la liste. */
    listTheme?: ListStyle;
    /** Mode des listes dans le wrapper. Par défaut : "list". */
    mode?: "list" | "mosaic";
    /** Composants de mosaïque. */
    MosaicComponent?: ReactComponent<LineProps<T>>;
    /** Largeur des mosaïques. Par défaut : 200. */
    mosaicWidth?: number;
    /** Hauteur des mosaïques. Par défaut : 200. */
    mosaicHeight?: number;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    /** Liste des colonnes sur lesquels on peut trier. */
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    /** Placeholder pour la barre de recherche de l'ActionBar. */
    searchBarPlaceholder?: string;
    /** Lance la recherche à la construction du composant. Par défaut: true. */
    searchOnMount?: boolean;
    /** Affiche les facettes qui n'ont qu'une seule valeur. */
    showSingleValuedFacets?: boolean;
    /** Store associé. */
    store: SearchStore<T>;
    /** CSS du Summary. */
    summaryTheme?: SummaryStyle;
    /** CSS. */
    theme?: AdvancedSearchStyle;
}

/** Composant tout intégré pour une recherche avancée, avec ActionBar, FacetBox, Summary, ListWrapper et Results. */
@autobind
@observer
export class AdvancedSearch<T> extends React.Component<AdvancedSearchProps<T>, void> {

    componentWillMount() {
        const {searchOnMount = true, store} = this.props;
        if (searchOnMount) {
            store.search();
        }
    }

    protected renderFacetBox() {
        const {theme, facetBoxPosition = "left", facetBoxTheme, i18nPrefix, nbDefaultDataListFacet, showSingleValuedFacets, store} = this.props;

        if (facetBoxPosition === "left") {
            return (
                 <div className={theme!.facetContainer}>
                    <FacetBox
                        i18nPrefix={i18nPrefix}
                        nbDefaultDataList={nbDefaultDataListFacet}
                        showSingleValuedFacets={showSingleValuedFacets}
                        store={store}
                        theme={facetBoxTheme}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    protected renderListSummary() {
        const {canRemoveSort, hideSummaryCriteria, hideSummaryFacets, hideSummaryGroup, hideSummarySort, i18nPrefix, orderableColumnList, store, summaryTheme} = this.props;
        return (
            <Summary
                canRemoveSort={canRemoveSort}
                i18nPrefix={i18nPrefix}
                hideCriteria={hideSummaryCriteria}
                hideFacets={hideSummaryFacets}
                hideGroup={hideSummaryGroup}
                hideSort={hideSummarySort}
                orderableColumnList={orderableColumnList}
                store={store}
                theme={summaryTheme}
            />
        );
    }

    protected renderActionBar() {
        const {actionBarTheme, facetBoxPosition = "left", hasGrouping, hasSearchBar, hasSelection, i18nPrefix, groupOperationList, orderableColumnList, nbDefaultDataListFacet, showSingleValuedFacets, searchBarPlaceholder, store} = this.props;

        if (store.groupingKey) {
            return null;
        }

        return (
            <ActionBar
                hasFacetBox={facetBoxPosition === "action-bar"}
                hasGrouping={hasGrouping}
                hasSearchBar={hasSearchBar}
                hasSelection={hasSelection}
                i18nPrefix={i18nPrefix}
                nbDefaultDataListFacet={nbDefaultDataListFacet}
                operationList={groupOperationList && groupOperationList({list: store.flatResultList})}
                orderableColumnList={orderableColumnList}
                searchBarPlaceholder={searchBarPlaceholder}
                showSingleValuedFacets={showSingleValuedFacets}
                store={store}
                theme={actionBarTheme}
            />
        );
    }

    protected renderResults() {
        const {groupTheme, listTheme, lineTheme, groupOperationList, hasSelection, i18nPrefix, isManualFetch, LineComponent, lineOperationList, MosaicComponent, store, isLineSelectionnable, EmptyComponent, DetailComponent, detailHeight, canOpenDetail, hasDragAndDrop, dragItemType, dragLayerTheme} = this.props;
        return (
            <Results
                canOpenDetail={canOpenDetail}
                detailHeight={detailHeight}
                DetailComponent={DetailComponent}
                dragItemType={dragItemType}
                dragLayerTheme={dragLayerTheme}
                EmptyComponent={EmptyComponent}
                groupOperationList={groupOperationList}
                groupTheme={groupTheme}
                hasDragAndDrop={hasDragAndDrop}
                hasSelection={!!hasSelection}
                i18nPrefix={i18nPrefix}
                isManualFetch={isManualFetch}
                LineComponent={LineComponent}
                lineOperationList={lineOperationList}
                lineTheme={lineTheme}
                listTheme={listTheme}
                MosaicComponent={MosaicComponent}
                isLineSelectionnable={isLineSelectionnable}
                store={store}
            />
        );
    }

    render() {
        const {addItemHandler, i18nPrefix, LineComponent, MosaicComponent, mode, mosaicHeight, mosaicWidth, hasBackToTop = true, theme} = this.props;
        return (
            <div>
                {this.renderFacetBox()}
                <div className={theme!.resultContainer}>
                    <ListWrapper
                        addItemHandler={addItemHandler}
                        canChangeMode={!!(LineComponent && MosaicComponent)}
                        i18nPrefix={i18nPrefix}
                        mode={mode || MosaicComponent && !LineComponent ? "mosaic" : "list"}
                        mosaicHeight={mosaicHeight}
                        mosaicWidth={mosaicWidth}
                    >
                        {this.renderListSummary()}
                        {this.renderActionBar()}
                        {this.renderResults()}
                    </ListWrapper>
                </div>
                {hasBackToTop ? <ButtonBackToTop /> : null}
            </div>
        );
    }
}

export default themr("advancedSearch", styles)(AdvancedSearch);
