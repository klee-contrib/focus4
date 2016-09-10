import {autobind} from "core-decorators";
import {t as translate} from "i18next";
import {reduce, omit} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import * as defaults from "../../../defaults";

import {SearchStore} from "../../store";
import {InputFacet} from "../../types";

export interface Props {
    /** Default: {} */
    groupableColumnList?: {[facet: string]: string};
    /** Default: true */
    hasGrouping?: boolean;
    isSelection?: boolean;
    operationList?: {};
    /** Default: {} */
    orderableColumnList?: {};
    selectionAction?: (status: string) => void;
    selectionStatus?: string;
    /** Default: {} */
    store: SearchStore;
};

@autobind
@observer
export class ActionBar extends React.Component<Props, {}> {
    static defaultProps = {
        groupableColumnList: {},
        hasGrouping: true,
        orderableColumnList: {},
        selectedFacets: {}
    };

    private filterFacetList() {
        const {selectedFacets} = this.props.store;
        return reduce(selectedFacets!, (result, facet, facetKey) => {
            result[facetKey] = {
                label: translate(`live.filter.facets.${facetKey}`),
                value: facet.value
            };
            return result;
        }, {} as {[facet: string]: {label: string, value: string}});
    }

    private onFacetClick(key: string) {
        const {store} = this.props;
        store.setProperties({selectedFacets: omit(store.selectedFacets!, key) as {[facet: string]: InputFacet}});
    }

    private orderAction(key: string, order: boolean) {
        this.props.store.setProperties({
            sortBy: key,
            sortAsc: order
        });
    }

    private groupAction(groupingKey: string) {
        this.props.store.setProperties({groupingKey});
    }

    render() {
        const {ActionBar} = defaults;
        if (!ActionBar) {
            throw new Error("Le composant ActionBar n'a pas été défini. Utiliser 'autofocus/defaults' pour enregistrer les défauts.");
        }

        const {groupableColumnList, hasGrouping, isSelection, operationList, orderableColumnList, selectionAction, selectionStatus, store} = this.props;
        return (
            <ActionBar
                data-focus="advanced-search-action-bar"
                facetClickAction={this.onFacetClick}
                facetList={this.filterFacetList()}
                groupAction={this.groupAction}
                groupableColumnList={groupableColumnList}
                groupLabelPrefix="live.filter.facets."
                groupSelectedKey={store.groupingKey}
                hasGrouping={hasGrouping}
                isSelection={isSelection}
                operationList={operationList}
                orderAction={this.orderAction}
                orderSelected={store.sortBy}
                orderableColumnList={orderableColumnList}
                selectionAction={selectionAction}
                selectionStatus={selectionStatus}
            />
        );
    }
}
