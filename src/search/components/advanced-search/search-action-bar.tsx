import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {omit, reduce} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import {DropdownItem} from "focus-components/dropdown";

import {ActionBar} from "../../../list";

import {SearchStore} from "../../store";

export interface Props {
    groupableColumnList?: {[facet: string]: string};
    hasSelection?: boolean;
    operationList?: DropdownItem[];
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    store: SearchStore;
};

@autobind
@observer
export class SearchActionBar extends React.Component<Props, void> {

    private filterFacetList() {
        const {selectedFacets, facets} = this.props.store;
        return reduce(selectedFacets, (result, facetValue, facetKey) => {
            const resultFacet = facets.find(facet => facetKey === facet.code);
            const resultFacetValue = resultFacet && resultFacet.values.find(facet => facet.code === facetValue);
            result[facetKey] = {
                code: facetKey,
                label: i18n.t(`live.filter.facets.${facetKey}`),
                value: resultFacetValue && resultFacetValue.label || facetValue
            };
            return result;
        }, {} as {[facet: string]: {code: string, label: string, value: string}});
    }

    private onFacetClick(key: string) {
        const {store} = this.props;
        store.setProperties({selectedFacets: omit(store.selectedFacets, key) as {[facet: string]: string}});
    }

    render() {
        const {groupableColumnList, hasSelection, operationList, orderableColumnList, store} = this.props;
        return (
            <ActionBar
                facetClickAction={this.onFacetClick}
                facetList={this.filterFacetList()}
                groupableColumnList={groupableColumnList}
                groupLabelPrefix="live.filter.facets."
                hasSelection={hasSelection}
                operationList={operationList}
                orderableColumnList={orderableColumnList}
                store={store}
            />
        );
    }
}
