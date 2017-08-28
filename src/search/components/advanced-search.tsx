import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import ButtonBackToTop from "focus-components/button-back-to-top";

import {GroupOperationListItem, LineOperationListItem, LineStyle, ListStyle, ListWrapper} from "../../list";

import {SearchStore} from "../store";
import ActionBar, {ActionBarStyle} from "./action-bar";
import FacetBox, {FacetBoxStyle} from "./facet-box";
import Results, {GroupStyle} from "./results";
import Summary, {SummaryStyle} from "./summary";

import * as styles from "./__style__/advanced-search.css";
export type AdvancedSearchStyle = Partial<typeof styles>;

export interface AdvancedSearchProps<T> {
    actionBarTheme?: ActionBarStyle;
    addItemHandler?: () => void;
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data?: T) => boolean;
    /** Par défaut : true */
    canRemoveSort?: boolean;
    DetailComponent?: React.ComponentClass<{data: T}> | React.SFC<{data: T}>;
    detailHeight?: number | ((data: T) => number);
    /** Component à afficher lorsque la liste est vide. Par défaut () => <div>{i18next.t("focus.list.empty")}</div> */
    EmptyComponent?: React.ComponentClass<{addItemHandler?: () => void}> | React.SFC<{addItemHandler?: () => void}>;
    /** Par défaut : "left" */
    facetBoxPosition?: "action-bar" | "left" | "none";
    facetBoxTheme?: FacetBoxStyle;
    groupOperationLists?: {[scope: string]: GroupOperationListItem<T>[]};
    groupTheme?: GroupStyle;
    /** Par défault: true */
    hasBackToTop?: boolean;
    hasGrouping?: boolean;
    hasSearchBar?: boolean;
    hasSelection?: boolean;
    hideSummaryCriteria?: boolean;
    hideSummaryFacets?: boolean;
    hideSummaryScope?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    isManualFetch?: boolean;
    lineComponentMapper?: (scope: string) => React.ComponentClass<{data?: T}> | React.SFC<{data?: T}>;
    lineOperationLists?: {[scope: string]: (data: T) => LineOperationListItem<T>[]};
    lineProps?: {};
    lineTheme?: LineStyle;
    listTheme?: ListStyle;
    mode?: "list" | "mosaic";
    mosaicComponentMapper?: (scope: string) => React.ComponentClass<{data?: T}> | React.SFC<{data?: T}>;
    mosaicWidth?: number;
    mosaicHeight?: number;
    /** Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    scopes: {code: string, label?: string}[];
    searchBarPlaceholder?: string;
    selectionnableInitializer?: () => boolean;
    showSingleValuedFacets?: boolean;
    store: SearchStore<T>;
    summaryTheme?: SummaryStyle;
    theme?: AdvancedSearchStyle;
}

@autobind
@observer
export class AdvancedSearch<T> extends React.Component<AdvancedSearchProps<T>, void> {

    componentWillMount() {
        this.props.store.search();
    }

    protected renderFacetBox() {
        const {theme, facetBoxPosition = "left", facetBoxTheme, i18nPrefix, nbDefaultDataListFacet, scopeFacetKey, showSingleValuedFacets, store} = this.props;

        if (facetBoxPosition === "left") {
            return (
                 <div className={theme!.facetContainer!}>
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
        const {groupTheme, listTheme, lineTheme, groupOperationLists, hasSelection, i18nPrefix, isManualFetch, lineComponentMapper, lineProps, lineOperationLists, mosaicComponentMapper, scopeFacetKey, store, selectionnableInitializer, EmptyComponent, DetailComponent, detailHeight, canOpenDetail} = this.props;
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
                lineProps={lineProps}
                lineOperationLists={lineOperationLists}
                lineTheme={lineTheme}
                listTheme={listTheme}
                mosaicComponentMapper={mosaicComponentMapper}
                scopeFacetKey={scopeFacetKey}
                selectionnableInitializer={selectionnableInitializer}
                store={store}
            />
        );
    }

    render() {
        const {addItemHandler, i18nPrefix, lineComponentMapper, mosaicComponentMapper, mode, mosaicHeight, mosaicWidth, hasBackToTop = true, theme} = this.props;
        return (
            <div>
                {this.renderFacetBox()}
                <div className={theme!.resultContainer!}>
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
