import {autobind} from "core-decorators";
import {forEach} from "lodash";
import {observable, computed, reaction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import BackToTop from "focus-components/button-back-to-top";
import {DropdownItem} from "focus-components/dropdown";

import {injectStyle} from "../../../theming";

import {SearchStore} from "../../store";
import {Results} from "../results";
import {SearchActionBar} from "./search-action-bar";
import {FacetBox, FacetBoxStyle, FacetStyle} from "./facet-box";
import {GroupComponent, GroupComponentStyle} from "./group-component";
import {ListSummary, ListSummaryStyle} from "./list-summary";
export {FacetBoxStyle, FacetStyle, GroupComponentStyle, ListSummaryStyle};

import * as styles from "./style/index.css";
export type AdvancedSearchStyle = typeof styles;

export interface AdvancedSearchProps {
    classNames?: AdvancedSearchStyle;
    /** Default: true */
    hasBackToTop?: boolean;
    /** Default: true */
    isSelection?: boolean;
    lineComponentMapper: (...args: any[]) => ReactComponent<any>;
    /** Default: [] */
    lineOperationList?: DropdownItem[];
    onLineClick?: (...args: any[]) => void;
    /** Default: [] */
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    /** Default: {} */
    openedFacetList?: {};
    scopes: {code: string, label: string}[];
    /** Default: {} */
    scopesConfig?: {[key: string]: string};
    scrollParentSelector?: string;
    scopeLock?: boolean;
    selectItem?: (data?: any, isSelected?: boolean) => void;
    selectionAction?: (status: string) => void;
    store: SearchStore;
}

@injectStyle("advancedSearch")
@autobind
@observer
export class AdvancedSearch extends React.Component<AdvancedSearchProps, void> {

    static defaultProps = {
        hasBackToTop: true,
        isSelection: true,
        lineOperationList: [],
        orderableColumnList: [],
        openedFacetList: {},
        scopesConfig: {}
    };

    results?: Results;

    @observable private selectionStatus?: "none" | "partial" | "selected";

    private reaction = reaction(() => [
        this.props.store.groupingKey,
        this.props.store.query,
        this.props.store.scope,
        this.props.store.selectedFacets,
        this.props.store.sortAsc,
        this.props.store.sortBy
    ], () => this.props.store.search, true, 100);

    @computed
    private get hasGrouping() {
        const {scope} = this.props.store;
        return scope !== undefined && scope !== "ALL";
    }

    componentWillUnmount() {
        this.reaction();
    }

    getSelectedItems() {
        const selectedItems: {}[] = [];
        if (this.results) {
            const {lists} = this.results;
            if (lists) {
                forEach(lists, list => {
                    if (list) {
                        selectedItems.push(...list.getSelectedItems());
                    }
                });
            }
        }
        return selectedItems;
    }

    private renderFacetBox() {
        const {scopesConfig, openedFacetList, store} = this.props;
        return (
            <FacetBox
                openedFacetList={openedFacetList || {}}
                scopesConfig={scopesConfig!}
                store={store}
            />
        );
    }

    private renderListSummary() {
        const {scopes, scopeLock, store} = this.props;
        return (
            <ListSummary
                scopes={scopes}
                scopeLock={!!scopeLock}
                store={store}
            />
        );
    }

    private renderActionBar() {
        const {isSelection, lineOperationList, orderableColumnList, store} = this.props;
        const groupableColumnList = store.facets ? store.facets.reduce((result, facet) => {
            if (facet.values.length > 1) {
                result[facet.code] = facet.label;
            }
            return result;
        }, {} as {[facet: string]: string}) : {};

        return (
            <SearchActionBar
                groupableColumnList={groupableColumnList}
                hasGrouping={this.hasGrouping}
                hasSelection={isSelection}
                operationList={store.totalCount > 0 ? lineOperationList : []}
                orderableColumnList={orderableColumnList}
                selectionAction={this.selectionAction}
                selectionStatus={this.selectionStatus}
                store={store}
            />
        );
    }

    private renderResults() {
        const {isSelection, onLineClick, lineComponentMapper, lineOperationList, scrollParentSelector, store} = this.props;
        return (
            <Results
                groupComponent={GroupComponent}
                isSelection={!!isSelection}
                lineClickHandler={onLineClick}
                lineComponentMapper={lineComponentMapper}
                lineOperationList={lineOperationList}
                lineSelectionHandler={this.selectItem}
                ref={results => this.results = results}
                renderSingleGroupDecoration={false}
                scrollParentSelector={scrollParentSelector}
                selectionStatus={this.selectionStatus}
                store={store}
            />
        );
    }

    private selectItem(data: any) {
        this.selectionStatus = "partial";
        if (this.props.selectItem) {
            this.props.selectItem(data);
        }
    }

    private selectionAction(selectionStatus: "none" | "partial" | "selected") {
        this.selectionStatus = selectionStatus;
        if (this.props.selectionAction) {
            this.props.selectionAction(selectionStatus);
        }
    }

    render() {
        const {store, hasBackToTop, classNames} = this.props;
        return (
            <div>
                {store.scope !== "ALL" ?
                    <div className={`${styles.facetContainer} ${classNames!.facetContainer || ""}`}>
                        {this.renderFacetBox()}
                    </div>
                : null}
                <div className={`${styles.resultContainer} ${classNames!.resultContainer || ""}`}>
                    {this.renderListSummary()}
                    {this.renderActionBar()}
                    {this.renderResults()}
                </div>
                {hasBackToTop && <BackToTop />}
            </div>
        );
    }
}
