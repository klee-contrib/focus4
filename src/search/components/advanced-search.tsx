import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ButtonBackToTop} from "../../components";
import {DetailProps, EmptyProps, GroupOperationListItem, LineOperationListItem, LineProps, LineStyle, ListStyle, ListWrapper} from "../../list";

import {SearchStore} from "../store";
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
    canOpenDetail?: (data?: T) => boolean;
    /** Permet de supprimer le tri. Par défaut : true */
    canRemoveSort?: boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: React.ComponentClass<DetailProps<T>> | React.SFC<DetailProps<T>>;
    /** Hauteur du composant de détail. Par défaut : 200. */
    detailHeight?: number | ((data: T) => number);
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: React.ComponentClass<EmptyProps<T>> | React.SFC<EmptyProps<T>>;
    /** Emplacement de la FacetBox. Par défaut : "left" */
    facetBoxPosition?: "action-bar" | "left" | "none";
    /** CSS de la FacetBox (si position = "left") */
    facetBoxTheme?: FacetBoxStyle;
    /** Actions de groupe par scope. */
    groupOperationLists?: {[scope: string]: GroupOperationListItem<T>[]};
    /** CSS des groupes. */
    groupTheme?: GroupStyle;
    /** Ajoute un bouton de retour en haut de page. Par défault: true */
    hasBackToTop?: boolean;
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
    /** Masque le scope dans le Summary. */
    hideSummaryScope?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Précise si chaque élément est sélectionnable ou non. Par défaut () => true. */
    isLineSelectionnable?: (data?: T) => boolean;
    /** Chargement manuel (à la place du scroll infini). */
    isManualFetch?: boolean;
    /** Composants de ligne par scope. */
    lineComponentMapper?: (scope: string) => React.ComponentClass<LineProps<T>> | React.SFC<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste, par scope. */
    lineOperationLists?: {[scope: string]: (data: T) => LineOperationListItem<T>[]};
    /** CSS des lignes. */
    lineTheme?: LineStyle;
    /** CSS de la liste. */
    listTheme?: ListStyle;
    /** Mode des listes dans le wrapper. Par défaut : "list". */
    mode?: "list" | "mosaic";
    /** Composants de mosaïque par scope. */
    mosaicComponentMapper?: (scope: string) => React.ComponentClass<LineProps<T>> | React.SFC<LineProps<T>>;
    /** Largeur des mosaïques. Par défaut : 200. */
    mosaicWidth?: number;
    /** Hauteur des mosaïques. Par défaut : 200. */
    mosaicHeight?: number;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    /** Liste des colonnes sur lesquels on peut trier. */
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    /** Nom de la facette de scope. Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    /** Détail des scopes de la recherche. */
    scopes: {code: string, label?: string}[];
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
        const {theme, facetBoxPosition = "left", facetBoxTheme, i18nPrefix, nbDefaultDataListFacet, scopeFacetKey, showSingleValuedFacets, store} = this.props;

        if (facetBoxPosition === "left") {
            return (
                 <div className={theme!.facetContainer}>
                    <FacetBox
                        i18nPrefix={i18nPrefix}
                        nbDefaultDataList={nbDefaultDataListFacet}
                        scopeFacetKey={scopeFacetKey}
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
        const {canRemoveSort, hideSummaryCriteria, hideSummaryFacets, hideSummaryScope, i18nPrefix, orderableColumnList, scopes, store, summaryTheme} = this.props;
        return (
            <Summary
                canRemoveSort={canRemoveSort}
                i18nPrefix={i18nPrefix}
                hideCriteria={hideSummaryCriteria}
                hideFacets={hideSummaryFacets}
                hideScope={hideSummaryScope}
                orderableColumnList={orderableColumnList}
                scopes={scopes}
                store={store}
                theme={summaryTheme}
            />
        );
    }

    protected renderActionBar() {
        const {actionBarTheme, facetBoxPosition = "left", hasGrouping, hasSearchBar, hasSelection, i18nPrefix, groupOperationLists, orderableColumnList, nbDefaultDataListFacet, scopeFacetKey, showSingleValuedFacets, searchBarPlaceholder, store} = this.props;

        if (store.groupingKey || store.scope === "ALL") {
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
                operationList={store.scope !== "ALL" && groupOperationLists && store.totalCount > 0 ? groupOperationLists[store.scope] : []}
                orderableColumnList={orderableColumnList}
                searchBarPlaceholder={searchBarPlaceholder}
                scopeFacetKey={scopeFacetKey}
                showSingleValuedFacets={showSingleValuedFacets}
                store={store}
                theme={actionBarTheme}
            />
        );
    }

    protected renderResults() {
        const {groupTheme, listTheme, lineTheme, groupOperationLists, hasSelection, i18nPrefix, isManualFetch, lineComponentMapper, lineOperationLists, mosaicComponentMapper, scopeFacetKey, store, isLineSelectionnable, EmptyComponent, DetailComponent, detailHeight, canOpenDetail} = this.props;
        return (
            <Results
                canOpenDetail={canOpenDetail}
                detailHeight={detailHeight}
                DetailComponent={DetailComponent}
                EmptyComponent={EmptyComponent}
                groupOperationLists={groupOperationLists}
                groupTheme={groupTheme}
                hasSelection={!!hasSelection}
                i18nPrefix={i18nPrefix}
                isManualFetch={isManualFetch}
                lineComponentMapper={lineComponentMapper}
                lineOperationLists={lineOperationLists}
                lineTheme={lineTheme}
                listTheme={listTheme}
                mosaicComponentMapper={mosaicComponentMapper}
                scopeFacetKey={scopeFacetKey}
                isLineSelectionnable={isLineSelectionnable}
                store={store}
            />
        );
    }

    render() {
        const {addItemHandler, i18nPrefix, lineComponentMapper, mosaicComponentMapper, mode, mosaicHeight, mosaicWidth, hasBackToTop = true, theme} = this.props;
        return (
            <div>
                {this.renderFacetBox()}
                <div className={theme!.resultContainer}>
                    <ListWrapper
                        addItemHandler={addItemHandler}
                        canChangeMode={!!(lineComponentMapper && mosaicComponentMapper)}
                        i18nPrefix={i18nPrefix}
                        mode={mode || mosaicComponentMapper && !lineComponentMapper ? "mosaic" : "list"}
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
