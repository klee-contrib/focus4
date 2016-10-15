import {autobind} from "core-decorators";
import {isFunction, reduce} from "lodash";
import {observable, computed, reaction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {ButtonBackToTop, ReactComponent} from "../../../defaults";
import {OperationListItem} from "../../../list";

import {SearchStore} from "../../store";
import {Results} from "../results";
import {SearchActionBar} from "./search-action-bar";
import {FacetBox} from "./facet-box";
import {GroupComponent} from "./group";
import {ListSummary} from "./list-summary";

export interface AdvancedSearchProps {
    /** Default: ButtonBackToTop */
    backToTopComponent?: typeof ButtonBackToTop;
    /** Default: true */
    hasBackToTop?: boolean;
    /** Default: true */
    isSelection?: boolean;
    lineComponentMapper: (...args: any[]) => ReactComponent<any>;
    /** Default: [] */
    lineOperationList?: OperationListItem[];
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

    @observable private selectionStatus?: "none" | "partial" | "selected";
    private reaction: () => void;

    @computed
    private get hasGrouping() {
        const {scope} = this.props.store;
        return scope !== undefined && scope !== "ALL";
    }

    componentWillMount() {
        const {store} = this.props;
        this.reaction = reaction(() => [
            store.groupingKey,
            store.query,
            store.scope,
            store.selectedFacets,
            store.sortAsc,
            store.sortBy
        ], () => store.search, true, 100);
    }

    componentWillUnmount() {
        this.reaction();
    }

    /** Cette fonction est le diable incarné. C'est vraiment laid. */
    getSelectedItems() {
        const results = this.refs["resultList"] as Results;
        const outSelectedItems = reduce(results.refs, (selectedItems, ref) => {
            if (isFunction((ref as any).getSelectedItems)) { // ListSelection dans le Results, cas sans groupes.
                selectedItems = selectedItems.concat((ref as any).getSelectedItems());
            } else if ((ref as any).refs) { // Groupes.
                selectedItems = selectedItems.concat(reduce((ref as any).refs, (subSelectedItems, subRef) => {
                    if (isFunction((subRef as any).getSelectedItems)) { // ListSection dans les Groupes.
                        subSelectedItems = subSelectedItems.concat((subRef as any).getSelectedItems());
                    }
                    return subSelectedItems;
                }, [] as any[]));
            }
            return selectedItems;
        }, [] as any[]);
        return outSelectedItems;
    }

    private renderFacetBox() {
        const {scopesConfig, openedFacetList, store} = this.props;
        return (
            <FacetBox
                openedFacetList={openedFacetList || {}}
                ref="facetBox"
                scopesConfig={scopesConfig!}
                store={store}
            />
        );
    }

    private renderListSummary() {
        const {scopes, scopeLock, store} = this.props;
        return (
            <ListSummary
                ref="summary"
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
                ref="actionBar"
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
                ref="resultList"
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
        // true if a facet is collapsed
        const facetCollapsedClassName = Object.keys(this.props.openedFacetList).length === 0 ? "facet-collapsed" : "";
        const {backToTopComponent, store} = this.props;
        const BackToTop = backToTopComponent || ButtonBackToTop;

        if (!BackToTop) {
            throw new Error("`backToTopComponent` n'a pas été défini. Vous manque-t'il un défaut ?");
        }

        return (
            <div className="advanced-search" data-focus="advanced-search">
                {store.scope !== "ALL" ?
                    <div data-focus="facet-container" className={facetCollapsedClassName}>
                        {this.renderFacetBox()}
                    </div>
                : null}
                <div data-focus="result-container">
                    {this.renderListSummary()}
                    {this.renderActionBar()}
                    {this.renderResults()}
                </div>
                {this.props.hasBackToTop && <BackToTop />}
            </div>
        );
    }
}
