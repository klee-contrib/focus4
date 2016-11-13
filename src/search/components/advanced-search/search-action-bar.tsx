import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {reduce, omit} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import {DropdownItem} from "focus-components/dropdown";

import {ActionBar} from "../../../list";

import {SearchStore} from "../../store";

export interface Props {
    /** Default: {} */
    groupableColumnList?: {[facet: string]: string};
    /** Default: true */
    hasGrouping?: boolean;
    hasSelection?: boolean;
    operationList?: DropdownItem[];
    /** Default: {} */
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    selectionAction?: (status: "none" | "partial" | "selected") => void;
    selectionStatus?: "none" | "partial" | "selected";
    /** Default: {} */
    store: SearchStore;
};

@autobind
@observer
export class SearchActionBar extends React.Component<Props, void> {
    static defaultProps = {
        groupableColumnList: {},
        hasGrouping: true,
        orderableColumnList: {},
        selectedFacets: {}
    };

    private filterFacetList() {
        const {selectedFacets} = this.props.store;
        return reduce(selectedFacets!, (result, facetValue, facetKey) => {
            result[facetKey] = {
                code: facetKey,
                label: i18n.t(`live.filter.facets.${facetKey}`),
                value: facetValue
            };
            return result;
        }, {} as {[facet: string]: {code: string, label: string, value: string}});
    }

    private onFacetClick(key: string) {
        const {store} = this.props;
        store.setProperties({selectedFacets: omit(store.selectedFacets!, key) as {[facet: string]: string}});
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
        const {groupableColumnList, hasGrouping, hasSelection, operationList, orderableColumnList, selectionAction, selectionStatus, store} = this.props;
        return (
            <ActionBar
                facetClickAction={this.onFacetClick}
                facetList={this.filterFacetList()}
                groupAction={this.groupAction}
                groupableColumnList={groupableColumnList}
                groupLabelPrefix="live.filter.facets."
                groupSelectedKey={store.groupingKey}
                hasGrouping={hasGrouping}
                hasSelection={hasSelection}
                operationList={operationList}
                orderAction={this.orderAction}
                orderSelected={{key: store.sortBy, order: store.sortAsc}}
                orderableColumnList={orderableColumnList}
                selectionAction={selectionAction}
                selectionStatus={selectionStatus}
            />
        );
    }
}
