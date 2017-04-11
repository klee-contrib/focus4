import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import BackToTop from "focus-components/button-back-to-top";

import {GroupOperationListItem, LineOperationListItem, ListWrapper} from "../../list";
import {injectStyle} from "../../theming";

import {SearchStore} from "../store";
import {ActionBar} from "./action-bar";
import {FacetBox} from "./facet-box";
import {Results} from "./results";
import {Summary} from "./summary";

import * as styles from "./__style__/advanced-search.css";
export type AdvancedSearchStyle = Partial<typeof styles>;

export interface AdvancedSearchProps {
    addItemHandler?: () => void;
    classNames?: AdvancedSearchStyle & {mosaicAdd?: string};
    groupOperationLists?: {[scope: string]: GroupOperationListItem<{}>[]};
    hasActionBarFacetBox?: boolean;
    /** Par défault: true */
    hasBackToTop?: boolean;
    hasSearchBar?: boolean;
    hasSelection?: boolean;
    isSingleScope?: boolean;
    lineComponentMapper?: (scope: string) => ReactComponent<any>;
    lineOperationLists?: {[scope: string]: (data: {}) => LineOperationListItem<{}>[]};
    lineProps?: {};
    mode?: "list" | "mosaic";
    mosaicComponentMapper?: (scope: string) => ReactComponent<any>;
    mosaicWidth?: number;
    mosaicHeight?: number;
    /** Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    scopes: {code: string, label?: string}[];
    searchBarPlaceholder?: string;
    store: SearchStore;
}

@injectStyle("advancedSearch")
@autobind
@observer
export class AdvancedSearch extends React.Component<AdvancedSearchProps, void> {

    componentWillMount() {
        this.props.store.search();
    }

    private renderFacetBox() {
        const {nbDefaultDataListFacet, scopeFacetKey, store} = this.props;
        return (
            <FacetBox
                nbDefaultDataList={nbDefaultDataListFacet}
                scopeFacetKey={scopeFacetKey}
                store={store}
            />
        );
    }

    private renderListSummary() {
        const {isSingleScope, scopes, store} = this.props;
        return (
            <Summary
                isSingleScope={!!isSingleScope}
                scopes={scopes}
                store={store}
            />
        );
    }

    private renderActionBar() {
        const {hasActionBarFacetBox, hasSearchBar, hasSelection, groupOperationLists, orderableColumnList, nbDefaultDataListFacet, scopeFacetKey, searchBarPlaceholder, store} = this.props;

        if (store.groupingKey) {
            return null;
        }

        return (
            <ActionBar
                hasFacetBox={hasActionBarFacetBox}
                hasSearchBar={hasSearchBar}
                hasSelection={hasSelection}
                nbDefaultDataListFacet={nbDefaultDataListFacet}
                operationList={store.scope !== "ALL" && groupOperationLists && store.totalCount > 0 ? groupOperationLists[store.scope] : []}
                orderableColumnList={orderableColumnList}
                searchBarPlaceholder={searchBarPlaceholder}
                scopeFacetKey={scopeFacetKey}
                store={store}
            />
        );
    }

    private renderResults() {
        const {classNames, groupOperationLists, hasSelection, lineComponentMapper, lineProps, lineOperationLists, mosaicComponentMapper, scopeFacetKey, store} = this.props;
        return (
            <Results
                classNames={{mosaicAdd: classNames && classNames.mosaicAdd}}
                groupOperationLists={groupOperationLists}
                hasSelection={!!hasSelection}
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
        const {addItemHandler, lineComponentMapper, mosaicComponentMapper, mode, mosaicHeight, mosaicWidth, hasBackToTop = true, classNames} = this.props;
        return (
            <div>
                <div className={`${styles.facetContainer} ${classNames!.facetContainer || ""}`}>
                    {this.renderFacetBox()}
                </div>
                <div className={`${styles.resultContainer} ${classNames!.resultContainer || ""}`}>
                    <ListWrapper
                        addItemHandler={addItemHandler}
                        canChangeMode={!!(lineComponentMapper && mosaicComponentMapper)}
                        mode={mode || mosaicComponentMapper && !lineComponentMapper ? "mosaic" : "list"}
                        mosaicHeight={mosaicHeight}
                        mosaicWidth={mosaicWidth}
                    >
                        {this.renderListSummary()}
                        {this.renderActionBar()}
                        {this.renderResults()}
                    </ListWrapper>
                </div>
                {hasBackToTop ? <BackToTop /> : null}
            </div>
        );
    }
}
