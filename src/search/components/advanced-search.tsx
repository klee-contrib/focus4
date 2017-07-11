import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import ButtonBackToTop from "focus-components/button-back-to-top";

import {GroupOperationListItem, LineOperationListItem, ListWrapper} from "../../list";

import {SearchStore} from "../store";
import ActionBar from "./action-bar";
import FacetBox from "./facet-box";
import Results from "./results";
import Summary from "./summary";

import * as styles from "./__style__/advanced-search.css";
export type AdvancedSearchStyle = Partial<typeof styles>;

export interface AdvancedSearchProps {
    addItemHandler?: () => void;
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data?: {}) => boolean;
    /** Par défaut : true */
    canRemoveSort?: boolean;
    DetailComponent?: React.ComponentClass<any> | React.SFC<any>;
    detailHeight?: number | ((data: {}) => number);
    /** Component à afficher lorsque la liste est vide. Par défaut () => <div>{i18n.t("focus.list.empty")}</div> */
    EmptyComponent?: React.ComponentClass<{addItemHandler?: () => void}> | React.SFC<{addItemHandler?: () => void}>;
    /** Par défaut : "left" */
    facetBoxPosition?: "action-bar" | "left" | "none";
    groupOperationLists?: {[scope: string]: GroupOperationListItem<{}>[]};
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
    lineComponentMapper?: (scope: string) => React.ComponentClass<any> | React.SFC<any>;
    lineOperationLists?: {[scope: string]: (data: {}) => LineOperationListItem<{}>[]};
    lineProps?: {};
    mode?: "list" | "mosaic";
    mosaicComponentMapper?: (scope: string) => React.ComponentClass<any> | React.SFC<any>;
    mosaicWidth?: number;
    mosaicHeight?: number;
    /** Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    scopes: {code: string, label?: string}[];
    searchBarPlaceholder?: string;
    showSingleValuedFacets?: boolean;
    store: SearchStore<any>;
    theme?: AdvancedSearchStyle & {mosaicAdd?: string};
}

@autobind
@observer
export class AdvancedSearch extends React.Component<AdvancedSearchProps, void> {

    componentWillMount() {
        this.props.store.search();
    }

    protected renderFacetBox() {
        const {theme, facetBoxPosition = "left", i18nPrefix, nbDefaultDataListFacet, scopeFacetKey, showSingleValuedFacets, store} = this.props;

        if (facetBoxPosition === "left") {
            return (
                 <div className={theme!.facetContainer!}>
                    <FacetBox
                        i18nPrefix={i18nPrefix}
                        nbDefaultDataList={nbDefaultDataListFacet}
                        scopeFacetKey={scopeFacetKey}
                        showSingleValuedFacets={showSingleValuedFacets}
                        store={store}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    protected renderListSummary() {
        const {canRemoveSort, hideSummaryCriteria, hideSummaryFacets, hideSummaryScope, i18nPrefix, orderableColumnList, scopes, store} = this.props;
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
            />
        );
    }

    protected renderActionBar() {
        const {facetBoxPosition = "left", hasGrouping, hasSearchBar, hasSelection, i18nPrefix, groupOperationLists, orderableColumnList, nbDefaultDataListFacet, scopeFacetKey, showSingleValuedFacets, searchBarPlaceholder, store} = this.props;

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
            />
        );
    }

    protected renderResults() {
        const {theme, groupOperationLists, hasSelection, i18nPrefix, isManualFetch, lineComponentMapper, lineProps, lineOperationLists, mosaicComponentMapper, scopeFacetKey, store, EmptyComponent, DetailComponent, detailHeight, canOpenDetail} = this.props;
        return (
            <Results
                canOpenDetail={canOpenDetail}
                detailHeight={detailHeight}
                DetailComponent={DetailComponent}
                EmptyComponent={EmptyComponent}
                theme={{mosaicAdd: theme && theme.mosaicAdd}}
                groupOperationLists={groupOperationLists}
                hasSelection={!!hasSelection}
                i18nPrefix={i18nPrefix}
                isManualFetch={isManualFetch}
                lineComponentMapper={lineComponentMapper}
                mosaicComponentMapper={mosaicComponentMapper}
                lineProps={lineProps}
                lineOperationLists={lineOperationLists}
                scopeFacetKey={scopeFacetKey}
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
