import {autobind} from "core-decorators";
import {omit, isArray, isEmpty} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import {ReactComponent} from "../../defaults";
import {ListSelection, OperationListItem} from "../../list";
import {translate} from "../../translation";

import {Results as ResultsType} from "../types";
import {SearchStore} from "../store";
import {GroupWrapper, GroupComponent} from "./group-wrapper";

function DefaultEmpty() {
    return (
        <div data-focus="empty-result">
            {translate("search.empty")}
        </div>
    );
}

export interface ResultsProps {
    /** Default: DefaultEmpty */
    emptyComponent?: () => React.ReactElement<any>;
    groupComponent: GroupComponent;
    groupingKey?: string;
    /** Default: 3 */
    initialRowsCount?: number;
    isSelection: boolean;
    lineClickHandler?: (item: any) => void;
    lineComponentMapper: (key: string, list: any[]) => ReactComponent<any>;
    lineOperationList?: OperationListItem[];
    lineSelectionHandler?: (data?: any, isSelected?: boolean) => void;
    /** Default: FCT_SCOPE */
    scopeFacetKey?: string;
    scrollParentSelector?: any;
    selectionStatus?: "none" | "partial" | "selected";
    renderSingleGroupDecoration: boolean;
    /** Default: 5 */
    showMoreAdditionalRows?: number;
    store: SearchStore;
}

@autobind
@observer
export class Results extends React.Component<ResultsProps, void> {
    static defaultProps = {
        emptyComponent: DefaultEmpty,
        initialRowsCount: 3,
        scopeFacetKey: "FCT_SCOPE",
        showMoreAdditionalRows: 5
    };

    private get key() {
        const {groupingKey, scopeFacetKey} = this.props;
        return groupingKey || scopeFacetKey!;
    }

    private renderSingleGroup(list: any[], key: string, label: string | undefined, count: number, isUnique?: boolean) {
        const {initialRowsCount, renderSingleGroupDecoration, groupComponent} = this.props;
        if (renderSingleGroupDecoration && !groupComponent) {
            console.warn("You are trying to wrap your list in a group without a groupComponent. Please give one or set 'renderSingleGroupDecoration' to false.");
        }

        if (isUnique) {
            if (renderSingleGroupDecoration && groupComponent) {
                return (
                    <GroupWrapper
                        count={count}
                        groupComponent={groupComponent}
                        groupKey={key}
                        groupLabel={label}
                        initialRowsCount={initialRowsCount!}
                        isUnique={true}
                        list={list}
                        ref={"group-" + key}
                        renderResultsList={this.renderResultsList}
                    />
                );
            } else {
                return this.renderResultsList(list, key, count, true);
            }
        } else if (groupComponent) {
            return (
                <GroupWrapper
                    count={count}
                    groupComponent={groupComponent}
                    groupKey={key}
                    groupLabel={label}
                    initialRowsCount={initialRowsCount!}
                    list={list}
                    ref={"group-" + key}
                    renderResultsList={this.renderResultsList}
                    showAllHandler={this.showAllHandler}
                />
            );
        } else {
            console.warn("Il vous manque un groupComponent pour afficher des groupes.");
            return <div />;
        }
    }

    private renderEmptyResults() {
        const Empty = this.props.emptyComponent!;
        return <Empty />;
    }

    private renderResultsList(list: any[], key: string, count: number, isUnique: boolean) {
        const {lineComponentMapper, isSelection, lineSelectionHandler, lineClickHandler, lineOperationList, scrollParentSelector, selectionStatus, store} = this.props;
        const {scope, isLoading} = store;
        const lineKey = scope === undefined || scope === "ALL" ? key : scope;
        const LineComponent = lineComponentMapper(lineKey, list);
        const hasMoreData = isUnique !== undefined && isUnique && list.length < count;
        return (
            <div>
                {ListSelection.create({
                    data: list,
                    "data-focus": "results-list",
                    fetchNextPage: this.onScrollReachedBottom,
                    hasMoreData,
                    isSelection,
                    LineComponent,
                    lineProps: {operationList: lineOperationList, onLineClick: lineClickHandler},
                    onSelection: lineSelectionHandler,
                    parentSelector: scrollParentSelector,
                    ref: "list-" + key,
                    selectionStatus
                } as any)}
                {isLoading &&
                    <div data-focus="loading-more-results">
                        {translate("search.loadingMore")}
                    </div>
                }
            </div>
        );
    }

    private showAllHandler(key: string) {
        const {store, scopeFacetKey, groupingKey} = this.props;
        if (store.facets.find(facet => facet.code === scopeFacetKey)) {
            this.scopeSelectionHandler(key);
        } else {
            this.facetSelectionHandler(groupingKey!, key);
        }
    }

    private scopeSelectionHandler(scope: string) {
        this.props.store.setProperties({scope});
    }

    private facetSelectionHandler(key: string, value: string) {
        let selectedFacets = Object.assign({}, this.props.store.selectedFacets || {}, {
            [key]: {
                key: value,
                data: {
                    label: value,
                    count: 0
                }
            }
        });
        this.props.store.setProperties({
            groupingKey: undefined,
            selectedFacets
        });
    }

    private onScrollReachedBottom() {
        const {isLoading, search} = this.props.store;
        if (!isLoading) {
            search(true);
        }
    }

    private getGroupCounts() {
        const {store, groupingKey, scopeFacetKey} = this.props;

        let scopeFacet = store.facets.filter(facet => facet.code === groupingKey);
        if (scopeFacet.length === 0) {
            scopeFacet = store.facets.filter(facet => facet.code === scopeFacetKey);
        }
        return scopeFacet[0].values.reduce((result, facetData) => {
            const {code, label, count} = facetData;
            result[code] = {label, count};
            return result;
        }, {} as {[group: string]: {label: string, count: number}});
    }

    render() {
        const {results, totalCount} = this.props.store;

        // If there is no result, render the given empty component
        if (0 === totalCount) {
            return this.renderEmptyResults();
        }

        let resultsMap: ResultsType< {[key: string]: any} >;

        // resultsMap est un objet avec une seule propriété (le scope) dans si on est dans une recherche scopée sans groupes, sinon c'est un array.
        if (isArray(results)) {
            resultsMap = results.filter(resultGroup => {
                const propertyGroupName = Object.keys(resultGroup)[0]; // group property name
                const list = resultGroup[propertyGroupName];
                return 0 !== list.length;
            });
        } else {
            resultsMap = omit(results || {}, (resultGroup: {[key: string]: any}) => {
                const propertyGroupName = Object.keys(resultGroup)[0]; // group property name
                const list = resultGroup[propertyGroupName];
                return 0 === list.length;
            }) as any;
        }

        if (isEmpty(resultsMap)) {
            return null;
        }

        if (!isArray(resultsMap)) {
            const keys = Object.keys(resultsMap);
            if (keys.length > 0) {
                const key = Object.keys(resultsMap)[0];
                const list = resultsMap[key];
                const count = totalCount;
                return this.renderSingleGroup(list, key, undefined, count, true);
            } else {
                return null;
            }
        } else if (isArray(resultsMap) && 1 === resultsMap.length) {
            const key = Object.keys(resultsMap[0])[0];
            const list = resultsMap[0][key];
            const count = totalCount;
            return this.renderSingleGroup(list, key, undefined, count, true);
        } else {
            const groupCounts = this.getGroupCounts();
            return (
                <div data-focus="search-results">
                {groupCounts ?
                    resultsMap.map(resultGroup  => {
                        const key = Object.keys(resultGroup)[0]; // group property name
                        const list = resultGroup[key];
                        const label = groupCounts[key] && groupCounts[key].label;
                        const count = groupCounts[key] && groupCounts[key].count;
                        return this.renderSingleGroup(list, key, label, count);
                    })
                : null}
                </div>
            );
        }
    }
}
