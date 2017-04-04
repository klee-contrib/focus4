import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import BackToTop from "focus-components/button-back-to-top";

import {ActionBar, GroupOperationListItem, LineOperationListItem} from "../../../list";
import {injectStyle} from "../../../theming";

import {SearchStore} from "../../store";
import {Results} from "../results";
import {FacetBox, FacetBoxStyle, FacetStyle} from "./facet-box";
import {Summary, SummaryStyle} from "./summary";
export {FacetBoxStyle, FacetStyle, SummaryStyle};

import * as styles from "./style/advanced-search.css";
export type AdvancedSearchStyle = Partial<typeof styles>;

export interface AdvancedSearchProps {
    classNames?: AdvancedSearchStyle;
    extraItems?: React.ReactElement<any>[];
    /** Par défaut : "after" */
    extraItemsPosition?: "before" | "after";
    groupOperationLists?: {[scope: string]: GroupOperationListItem<{}>[]};
    /** Par défault: true */
    hasBackToTop?: boolean;
    hasSearchBar?: boolean;
    hasSelection?: boolean;
    isSingleScope?: boolean;
    lineComponentMapper: (scope: string) => ReactComponent<any>;
    lineOperationLists?: {[scope: string]: (data: {}) => LineOperationListItem<{}>[]};
    lineProps?: {};
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
        const {nbDefaultDataListFacet = 6, scopeFacetKey = "FCT_SCOPE", store} = this.props;
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
        const {hasSearchBar, hasSelection, groupOperationLists, orderableColumnList, searchBarPlaceholder, store} = this.props;

        if (store.groupingKey) {
            return null;
        }

        const groupableColumnList = store.facets && store.scope !== "ALL" ? store.facets.reduce((result, facet) => {
            if (facet.values.length > 1) {
                result[facet.code] = facet.label;
            }
            return result;
        }, {} as {[facet: string]: string}) : {};

        return (
            <ActionBar
                groupableColumnList={groupableColumnList}
                hasSearchBar={hasSearchBar}
                hasSelection={hasSelection}
                operationList={store.scope !== "ALL" && groupOperationLists && store.totalCount > 0 ? groupOperationLists[store.scope] : []}
                orderableColumnList={orderableColumnList}
                searchBarPlaceholder={searchBarPlaceholder}
                store={store}
            />
        );
    }

    private renderResults() {
        const {groupOperationLists, hasSelection, lineComponentMapper, lineProps, lineOperationLists, scopeFacetKey, store, extraItems, extraItemsPosition} = this.props;
        return (
            <Results
                extraItems={extraItems}
                extraItemsPosition={extraItemsPosition}
                groupOperationLists={groupOperationLists}
                hasSelection={!!hasSelection}
                lineComponentMapper={lineComponentMapper}
                lineProps={lineProps}
                lineOperationLists={lineOperationLists}
                scopeFacetKey={scopeFacetKey}
                store={store}
            />
        );
    }

    render() {
        const {hasBackToTop = true, classNames} = this.props;
        return (
            <div>
                <div className={`${styles.facetContainer} ${classNames!.facetContainer || ""}`}>
                    {this.renderFacetBox()}
                </div>
                <div className={`${styles.resultContainer} ${classNames!.resultContainer || ""}`}>
                    {this.renderListSummary()}
                    {this.renderActionBar()}
                    {this.renderResults()}
                </div>
                {hasBackToTop ? <BackToTop /> : null}
            </div>
        );
    }
}
