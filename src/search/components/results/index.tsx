import {autobind} from "core-decorators";
import i18next from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";

import Button from "focus-components/button";

import {GroupOperationListItem, LineOperationListItem, LineStyle, ListStyle} from "../../../list";

import {SearchStore} from "../../store";
import {GroupResult} from "../../types";
import Group, {GroupStyle} from "./group";
export {GroupStyle};

import {bottomRow} from "../../../list/components/__style__/list.css";

export interface ResultsProps<T> {
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data?: T) => boolean;
    DetailComponent?: React.ComponentClass<{data: T}> | React.SFC<{data: T}>;
    detailHeight?: number | ((data: T) => number);
    /** Component à afficher lorsque la liste est vide. Par défaut () => <div>{i18next.t("focus.list.empty")}</div> */
    EmptyComponent?: React.ComponentClass<{addItemHandler?: () => void}> | React.SFC<{addItemHandler?: () => void}>;
    groupOperationLists?: {[scope: string]: GroupOperationListItem<T>[]};
    /** Par défaut: 5 */
    groupPageSize?: number;
    groupTheme?: GroupStyle;
    hasSelection: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    isManualFetch?: boolean;
    lineComponentMapper?: (scope: string) => React.ComponentClass<{data?: T}> | React.SFC<{data?: T}>;
    lineOperationLists?: {[scope: string]: (data: {}) => LineOperationListItem<T>[]};
    lineProps?: {};
    lineTheme?: LineStyle;
    listTheme?: ListStyle;
    mosaicComponentMapper?: (scope: string) => React.ComponentClass<{data?: T}> | React.SFC<{data?: T}>;
    /** Par défaut : 250 */
    offset?: number;
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    selectionnableInitializer?: (data?: T) => boolean;
    store: SearchStore<T>;
}

@autobind
@observer
export class Results<T> extends React.Component<ResultsProps<T>, void> {

    componentDidMount() {
        window.addEventListener("scroll", this.scrollListener);
        window.addEventListener("resize", this.scrollListener);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollListener);
        window.removeEventListener("resize", this.scrollListener);
    }

    protected scrollListener() {
        const {store, offset = 250, isManualFetch} = this.props;
        if (!isManualFetch && store.currentCount < store.totalCount && !(store.groupingKey || store.scope === "ALL")) {
            const el = findDOMNode(this) as HTMLElement;
            const scrollTop = window.pageYOffset;
            if (el && topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight) < offset) {
                if (!store.isLoading) {
                    store.search(true);
                }
            }
        }
    }

    protected get showMoreButton() {
        const {store, isManualFetch, i18nPrefix = "focus"} = this.props;
        if (isManualFetch && store.currentCount < store.totalCount && !store.groupingKey) {
            return (
                <div className={bottomRow}>
                    <Button
                        onClick={() => !store.isLoading && store.search(true)}
                        icon={i18next.t(`${i18nPrefix}.icons.list.add.name`)}
                        iconLibrary={i18next.t(`${i18nPrefix}.icons.list.add.library`)}
                        shape={null}
                        type="button"
                        label={`${i18next.t(`${i18nPrefix}.list.show.more`)}`}
                    />
                </div>
            );
        }

        return null;
    }

    protected renderSingleGroup(group: GroupResult<{}>) {
        const {lineTheme, listTheme, groupTheme, groupOperationLists = {}, groupPageSize = 5, hasSelection, i18nPrefix, lineComponentMapper, mosaicComponentMapper, lineProps, selectionnableInitializer, lineOperationLists = {}, store, EmptyComponent, DetailComponent, detailHeight, canOpenDetail} = this.props;
        const groupKey = store.scope === "ALL" && group.code ? group.code : store.scope;
        const LineComponent = lineComponentMapper && lineComponentMapper(groupKey);
        const MosaicComponent = mosaicComponentMapper && mosaicComponentMapper(groupKey);
        if (LineComponent || MosaicComponent) {
            return (
                <Group
                    canOpenDetail={canOpenDetail}
                    key={group.code}
                    group={group}
                    groupOperationList={groupOperationLists[groupKey]}
                    hasSelection={hasSelection}
                    i18nPrefix={i18nPrefix}
                    DetailComponent={DetailComponent}
                    detailHeight={detailHeight}
                    EmptyComponent={EmptyComponent}
                    LineComponent={LineComponent}
                    lineProps={lineProps}
                    lineOperationList={lineOperationLists[groupKey]}
                    lineTheme={lineTheme}
                    listTheme={listTheme}
                    MosaicComponent={MosaicComponent}
                    perPage={groupPageSize}
                    selectionnableInitializer={selectionnableInitializer}
                    showAllHandler={this.showAllHandler}
                    store={store}
                    theme={groupTheme}
                />
            );
        } else {
            return null;
        }
    }

    protected showAllHandler(key: string) {
        const {store, scopeFacetKey = "FCT_SCOPE"} = this.props;
        if (store.facets.find(facet => facet.code === scopeFacetKey)) {
            this.scopeSelectionHandler(key);
        } else {
            this.facetSelectionHandler(store.groupingKey!, key);
        }
    }

    protected scopeSelectionHandler(scope: string) {
        this.props.store.setProperties({scope});
    }

    protected facetSelectionHandler(key: string, value: string) {
        const {selectedFacets, setProperties} = this.props.store;
        setProperties({
            groupingKey: undefined,
            selectedFacets: {...selectedFacets, [key]: value}
        });
    }

    render() {
        const {results} = this.props.store;

        // result.totalCount pour une liste seule est undefined, donc il est bien gardé.
        const filteredResults = results.filter(result => result.totalCount !== 0);

        if (!filteredResults.length) {
            return null;
        } else if (filteredResults.length === 1) {
            return (
                <div>
                    {this.renderSingleGroup(filteredResults[0])}
                    {this.showMoreButton}
                </div>
            );
        } else {
            return <div>{filteredResults.map(this.renderSingleGroup)}</div>;
        }
    }
}

export default Results;

function topOfElement(element: HTMLElement): number {
    if (!element) {
        return 0;
    }
    return element.offsetTop + topOfElement((element.offsetParent as HTMLElement));
}
