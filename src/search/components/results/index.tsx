import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";

import {GroupOperationListItem, LineOperationListItem} from "../../../list";

import {SearchStore} from "../../store";
import {GroupResult} from "../../types";
import {Group, GroupStyle} from "./group";
export {GroupStyle};

export interface ResultsProps {
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data?: {}) => boolean;
    DetailComponent?: React.ComponentClass<any> | React.SFC<any>;
    detailHeight?: number | ((data: {}) => number);
    /** Component à afficher lorsque la liste est vide. Par défaut () => <div>{i18n.t("focus.list.empty")}</div> */
    EmptyComponent?: React.ComponentClass<{addItemHandler?: () => void}> | React.SFC<{addItemHandler?: () => void}>;
    groupOperationLists?: {[scope: string]: GroupOperationListItem<{}>[]};
    /** Par défaut: 5 */
    groupPageSize?: number;
    hasSelection: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    lineComponentMapper?: (scope: string) => React.ComponentClass<any> | React.SFC<any>;
    lineProps?: {};
    lineOperationLists?: {[scope: string]: (data: {}) => LineOperationListItem<{}>[]};
    mosaicComponentMapper?: (scope: string) => React.ComponentClass<any> | React.SFC<any>;
    /** Par défaut : 250 */
    offset?: number;
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    store: SearchStore<any>;
    theme?: {mosaicAdd?: string};
}

@autobind
@observer
export class Results extends React.Component<ResultsProps, void> {

    private get key() {
        const {store, scopeFacetKey = "FCT_SCOPE"} = this.props;
        return store.groupingKey || scopeFacetKey;
    }

    componentDidMount() {
        window.addEventListener("scroll", this.scrollListener);
        window.addEventListener("resize", this.scrollListener);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollListener);
        window.removeEventListener("resize", this.scrollListener);
    }

    private scrollListener() {
        const {store, offset = 250} = this.props;
        if (store.currentCount < store.totalCount && !store.groupingKey) {
            const el = findDOMNode(this) as HTMLElement;
            const scrollTop = window.pageYOffset;
            if (el && topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight) < offset) {
                if (!store.isLoading) {
                    store.search(true);
                }
            }
        }
    }

    private renderSingleGroup(group: GroupResult<{}>) {
        const {theme, groupOperationLists = {}, groupPageSize = 5, hasSelection, i18nPrefix, lineComponentMapper, mosaicComponentMapper, lineProps, lineOperationLists = {}, store, EmptyComponent, DetailComponent, detailHeight, canOpenDetail} = this.props;
        const groupKey = store.scope === "ALL" && group.code ? group.code : store.scope;
        return (
            <Group
                canOpenDetail={canOpenDetail}
                key={group.code}
                theme={theme}
                group={group}
                groupOperationList={groupOperationLists[groupKey]}
                hasSelection={hasSelection}
                i18nPrefix={i18nPrefix}
                DetailComponent={DetailComponent}
                detailHeight={detailHeight}
                EmptyComponent={EmptyComponent}
                LineComponent={lineComponentMapper && lineComponentMapper(groupKey)}
                MosaicComponent={mosaicComponentMapper && mosaicComponentMapper(groupKey)}
                lineProps={lineProps}
                lineOperationList={lineOperationLists[groupKey]}
                perPage={groupPageSize}
                showAllHandler={this.showAllHandler}
                store={store}
            />
        );
    }

    private showAllHandler(key: string) {
        const {store, scopeFacetKey = "FCT_SCOPE"} = this.props;
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
            return this.renderSingleGroup(filteredResults[0]);
        } else {
            return <div>{filteredResults.map(this.renderSingleGroup)}</div>;
        }
    }
}

function topOfElement(element: HTMLElement): number {
    if (!element) {
        return 0;
    }
    return element.offsetTop + topOfElement((element.offsetParent as HTMLElement));
}
