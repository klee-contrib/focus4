import {autobind} from "core-decorators";
import {clone, omit, isArray} from "lodash";
import * as React from "react";

import {ReactComponent} from "../../defaults";
import {ListSelection} from "../../list/component/list-selection";
import {OperationListItem} from "../../list/component/memory-list";
import {translate} from "../../translation";

import {SearchAction} from "../action-builder";
import {SearchStore} from "../store/search";
import {StoreFacet, Results as ResultsType} from "../types";
import {GroupWrapper, GroupComponent} from "./group-wrapper";

function DefaultEmpty() {
    return (
        <div data-focus="empty-result">
            {translate("search.empty")}
        </div>
    );
}

export interface ResultsProps {
    action: SearchAction;
    /** Default: DefaultEmpty */
    emptyComponent?: () => React.ReactElement<any>;
    groupComponent: GroupComponent;
    groupingKey?: string;
    idField?: string;
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
    resultsMap?: ResultsType< {[key: string]: any} >;
    resultsFacets?: StoreFacet[];
    /** Default: 5 */
    showMoreAdditionalRows?: number;
    store: SearchStore<any>;
    totalCount: number;
}

export interface ResultsState {
    groupsRowsCounts?: {[x: string]: number};
    loading?: boolean;
}

@autobind
export class Results extends React.Component<ResultsProps, ResultsState> {
    static defaultProps = {
        emptyComponent: DefaultEmpty,
        initialRowsCount: 3,
        scopeFacetKey: "FCT_SCOPE",
        showMoreAdditionalRows: 5
    };

    constructor(props: ResultsProps) {
        super(props);
        this.state = {loading: false};
    }

    componentWillReceiveProps() {
        if (this.state.loading) {
            this.setState({loading: false});
        }
    }

    getShowMoreHandler(key: string) {
        return () => {
            let groupsRowsCounts = clone(this.state.groupsRowsCounts) || {};
            groupsRowsCounts[key] = groupsRowsCounts[key] ? groupsRowsCounts[key] + (this.props.showMoreAdditionalRows!) : (this.props.initialRowsCount!);
            this.setState({groupsRowsCounts});
        };
    }

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
        const {lineComponentMapper, idField, isSelection, lineSelectionHandler, lineClickHandler, lineOperationList, scrollParentSelector, selectionStatus, store} = this.props;
        const scope = store.get<string>("scope");
        const lineKey = scope === undefined || scope === "ALL" ? key : scope;
        const LineComponent = lineComponentMapper(lineKey, list);
        const hasMoreData = isUnique !== undefined && isUnique && list.length < count;
        return (
            <div>
                <ListSelection
                    data={list}
                    data-focus="results-list"
                    fetchNextPage={this.onScrollReachedBottom}
                    hasMoreData={hasMoreData}
                    idField={idField}
                    isSelection={isSelection}
                    LineComponent={LineComponent}
                    onLineClick={lineClickHandler}
                    onSelection={lineSelectionHandler}
                    operationList={lineOperationList}
                    parentSelector={scrollParentSelector}
                    ref={"list-" + key}
                    selectionStatus={selectionStatus}
                />
                {this.state.loading &&
                    <div data-focus="loading-more-results">
                        {translate("search.loadingMore")}
                    </div>
                }
            </div>
        );
    }

    private showAllHandler(key: string) {
        const {resultsFacets, scopeFacetKey, groupingKey} = this.props;
        if (resultsFacets && resultsFacets.find(facet => facet.code === scopeFacetKey)) {
            this.scopeSelectionHandler(key);
        } else {
            this.facetSelectionHandler(groupingKey!, key);
        }
    }

    private scopeSelectionHandler(scope: string) {
        this.props.action.updateProperties({scope});
    }

    private facetSelectionHandler(key: string, value: string) {
        let selectedFacets = Object.assign({}, this.props.store.get("selectedFacets"), {
            [key]: {
                key: value,
                data: {
                    label: value,
                    count: 0
                }
            }
        });
        this.props.action.updateProperties({
            groupingKey: undefined,
            selectedFacets
        });
    }

    private onScrollReachedBottom() {
        if (!this.state.loading) {
            this.setState({
                loading: true
            }, () => {
                this.props.action.search(true);
            });
        }
    }

    private getGroupCounts() {
        const {resultsFacets, groupingKey, scopeFacetKey} = this.props;
        if (resultsFacets) {
            let scopeFacet = resultsFacets.filter(facet => facet.code === groupingKey);
            if (scopeFacet.length === 0) {
                scopeFacet = resultsFacets.filter(facet => facet.code === scopeFacetKey);
            }
            return scopeFacet[0].values.map(facetData => {
                const {label, count} = facetData;
                return {label, count};
            });
        }
        return undefined;
    }

    render() {
        // If there is no result, render the given empty component
        if (0 === this.props.totalCount) {
            return this.renderEmptyResults();
        }

        let resultsMap: ResultsType< {[key: string]: any} >;

        // resultsMap est un objet avec une seule propriété (le scope) dans si on est dans une recherche scopée sans groupes, sinon c'est un array.
        if (isArray(this.props.resultsMap)) {
            resultsMap = this.props.resultsMap.filter(resultGroup => {
                const propertyGroupName = Object.keys(resultGroup)[0]; // group property name
                const list = resultGroup[propertyGroupName];
                return 0 !== list.length;
            });
        } else {
            resultsMap = omit(this.props.resultsMap || {}, (resultGroup: {[key: string]: any}) => {
                const propertyGroupName = Object.keys(resultGroup)[0]; // group property name
                const list = resultGroup[propertyGroupName];
                return 0 === list.length;
            }) as any;
        }

        if (!isArray(resultsMap)) {
            const keys = Object.keys(resultsMap);
            if (keys.length > 0) {
                const key = Object.keys(resultsMap)[0];
                const list = resultsMap[key];
                const count = this.props.totalCount;
                return this.renderSingleGroup(list, key, undefined, count, true);
            } else {
                return null;
            }
        } else if (isArray(resultsMap) && 1 === resultsMap.length) {
            const key = Object.keys(resultsMap[0])[0];
            const list = resultsMap[0][key];
            const count = this.props.totalCount;
            return this.renderSingleGroup(list, key, undefined, count, true);
        } else {
            const groupCounts = this.getGroupCounts();
            return (
                <div data-focus="search-results">
                {
                    groupCounts ?
                        resultsMap.map(resultGroup  => {
                            const key = Object.keys(resultGroup)[0]; // group property name
                            const list = resultGroup[key];
                            const label = groupCounts[0] && groupCounts[0].label;
                            const count = groupCounts[0] && groupCounts[0].count;
                            return this.renderSingleGroup(list, key, label, count);
                        })
                    : null}
                }
                </div>
            );
        }
    }
}
