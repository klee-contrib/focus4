import {autobind} from "core-decorators";
import {reduce, omit} from "lodash";
import * as React from "react";

import * as defaults from "defaults";
import {translate} from "translation";

import {SearchAction} from "../../action-builder";
import {InputFacet} from "../../types";

export interface Props {
    action: SearchAction;
    /** Default: {} */
    groupableColumnList?: {[facet: string]: string};
    groupingKey?: string;
    /** Default: true */
    hasGrouping?: boolean;
    isSelection?: boolean;
    lineOperationList?: {}[];
    operationList?: {};
    /** Default: {} */
    orderableColumnList?: {};
    selectionAction?: (status: string) => void;
    selectionStatus?: string;
    /** Default: {} */
    selectedFacets?: {[facet: string]: InputFacet};
    sortBy?: string;
};

@autobind
export class ActionBar extends React.Component<Props, {}> {
    static defaultProps = {
        groupableColumnList: {},
        hasGrouping: true,
        orderableColumnList: {},
        selectedFacets: {}
    };

    private filterFacetList() {
        const {selectedFacets} = this.props;
        return reduce(selectedFacets!, (result, facet, facetKey) => {
            result[facetKey] = {
                label: translate(`live.filter.facets.${facetKey}`),
                value: facet.value
            };
            return result;
        }, {} as {[facet: string]: {label: string, value: string}});
    }

    private onFacetClick(key: string) {
        const {selectedFacets, action: {updateProperties}} = this.props;
        updateProperties({selectedFacets: omit(selectedFacets!, key) as {[facet: string]: InputFacet}});
    }

    private orderAction(key: string, order: boolean) {
        this.props.action.updateProperties({
            sortBy: key,
            sortAsc: order
        });
    }

    private groupAction(groupingKey: string) {
        this.props.action.updateProperties({groupingKey});
    }

    render() {
        const {ActionBar} = defaults;
        if (!ActionBar) {
            throw new Error("Le composant ActionBar n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts.");
        }

        const {groupableColumnList, groupingKey, hasGrouping, isSelection, operationList, orderableColumnList, selectionAction, selectionStatus, sortBy} = this.props;
        return (
            <ActionBar
                data-focus="advanced-search-action-bar"
                facetClickAction={this.onFacetClick}
                facetList={this.filterFacetList()}
                groupAction={this.groupAction}
                groupableColumnList={groupableColumnList}
                groupLabelPrefix="live.filter.facets."
                groupSelectedKey={groupingKey}
                hasGrouping={hasGrouping}
                isSelection={isSelection}
                operationList={operationList}
                orderAction={this.orderAction}
                orderSelected={sortBy}
                orderableColumnList={orderableColumnList}
                selectionAction={selectionAction}
                selectionStatus={selectionStatus}
            />
        );
    }
}
