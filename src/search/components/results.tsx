import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {isArray, isEmpty, omitBy} from "lodash";
import {IObservableArray, isObservableArray} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";

import {OperationListItem, StoreList} from "../../list";

import {SearchStore} from "../store";
import {GroupComponent, GroupWrapper} from "./group-wrapper";

const FCT_SCOPE = "FCT_SCOPE";

export interface ResultsProps {
    emptyComponent?: () => React.ReactElement<any>;
    groupComponent: GroupComponent;
    /** Par défaut: 3 */
    initialRowsCount?: number;
    hasSelection: boolean;
    lineClickHandler?: (item: any) => void;
    lineComponentMapper: (key: string, list: any[]) => ReactComponent<any>;
    lineOperationList?: OperationListItem[];
    /** Par défaut : 250 */
    offset?: number;
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    renderSingleGroupDecoration: boolean;
    store: SearchStore;
}

@autobind
@observer
export class Results extends React.Component<ResultsProps, void> {

    private get key() {
        const {store, scopeFacetKey = FCT_SCOPE} = this.props;
        return store.groupingKey || scopeFacetKey;
    }

    componentDidMount() {
        this.attachScrollListener();
    }

    componentDidUpdate() {
        this.attachScrollListener();
    }

    componentWillUnmount() {
        this.detachScrollListener();
    }

    private attachScrollListener() {
        window.addEventListener("scroll", this.scrollListener);
        window.addEventListener("resize", this.scrollListener);
        this.scrollListener();
    }

    private detachScrollListener() {
        window.removeEventListener("scroll", this.scrollListener);
        window.removeEventListener("resize", this.scrollListener);
    }

    private scrollListener() {
        const el = findDOMNode(this) as HTMLElement;
        const scrollTop = window.pageYOffset;
        if (topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight) < (this.props.offset || 250)) {
            this.detachScrollListener();
            const {isLoading, search} = this.props.store;
            if (!isLoading) {
                search(true);
            }
        }
    }

    private renderSingleGroup(list: any[], key: string, label: string | undefined, count: number, isUnique?: boolean) {
        const {initialRowsCount = 3, renderSingleGroupDecoration, groupComponent} = this.props;
        if (renderSingleGroupDecoration && !groupComponent) {
            console.warn("You are trying to wrap your list in a group without a groupComponent. Please give one or set 'renderSingleGroupDecoration' to false.");
        }

        if (isUnique) {
            if (renderSingleGroupDecoration && groupComponent) {
                return (
                    <GroupWrapper
                        key={key}
                        count={count}
                        groupComponent={groupComponent}
                        groupKey={key}
                        groupLabel={label}
                        initialRowsCount={initialRowsCount}
                        isUnique={true}
                        list={list}
                        renderResultsList={this.renderResultsList}
                    />
                );
            } else {
                return this.renderResultsList(list, key);
            }
        } else if (groupComponent) {
            return (
                <GroupWrapper
                    count={count}
                    groupComponent={groupComponent}
                    groupKey={key}
                    groupLabel={label}
                    initialRowsCount={initialRowsCount}
                    list={list}
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
        const Empty = this.props.emptyComponent || (() => <div>{i18n.t("search.empty")}</div>);
        return <Empty />;
    }

    private renderResultsList(list: any[], key: string) {
        const {lineComponentMapper, hasSelection, lineClickHandler, lineOperationList, store} = this.props;
        const {scope, isLoading} = store;
        const lineKey = scope === undefined || scope === "ALL" ? key : scope;
        const LineComponent = lineComponentMapper(lineKey, list);
        return (
            <div>
                <StoreList
                    data={list}
                    hasSelection={hasSelection}
                    LineComponent={LineComponent}
                    lineProps={{operationList: lineOperationList, onLineClick: lineClickHandler} as any}
                    store={store as any}
                />
                {isLoading &&
                    <div style={{padding: "15px"}}>
                        {i18n.t("search.loadingMore")}
                    </div>
                }
            </div>
        );
    }

    private showAllHandler(key: string) {
        const {store, scopeFacetKey = FCT_SCOPE} = this.props;
        if (store.facets.find(facet => facet.code === scopeFacetKey)) {
            this.scopeSelectionHandler(key);
        } else {
            this.facetSelectionHandler(store.groupingKey!, key);
        }
    }

    private scopeSelectionHandler(scope: string) {
        this.props.store.setProperties({scope});
    }

    private facetSelectionHandler(key: string, value: string) {
        const {selectedFacets = {}, setProperties} = this.props.store;
        setProperties({
            groupingKey: undefined,
            selectedFacets: {...selectedFacets, [key]: value}
        });
    }

    private getGroupCounts() {
        const {store, scopeFacetKey = FCT_SCOPE} = this.props;

        let scopeFacet = store.facets.filter(facet => facet.code === store.groupingKey);
        if (scopeFacet.length === 0) {
            scopeFacet = store.facets.filter(facet => facet.code === scopeFacetKey);
        }
        if (scopeFacet.length) {
            return scopeFacet[0].values.reduce((result, facetData) => {
                const {code, label, count} = facetData;
                result[code] = {label, count};
                return result;
            }, {} as {[group: string]: {label: string, count: number}});
        } else {
            return undefined;
        }
    }

    render() {
        const {results, totalCount} = this.props.store;

        // If there is no result, render the given empty component
        if (0 === totalCount) {
            return this.renderEmptyResults();
        }

        let resultsMap;

        // resultsMap est un objet avec une seule propriété (le scope) dans si on est dans une recherche scopée sans groupes, sinon c'est un array.
        if (isObservableArray(results)) {
            resultsMap = results.filter(resultGroup => {
                const propertyGroupName = Object.keys(resultGroup)[0]; // group property name
                const list = resultGroup[propertyGroupName];
                return 0 !== list.length;
            });
        } else {
            resultsMap = omitBy(results || {}, (resultGroup: {}[]) => !resultGroup.length) as {[group: string]: IObservableArray<{}>};
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
                <div>
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

function topOfElement(element: HTMLElement): number {
    if (!element) {
        return 0;
    }
    return element.offsetTop + topOfElement((element.offsetParent as HTMLElement));
};
