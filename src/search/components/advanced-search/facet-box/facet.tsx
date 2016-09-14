import {autobind} from "core-decorators";
import {uniqueId} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {translate} from "../../../../translation";

import {FacetData, FacetValue} from "./facet-data";

export interface FacetProps {
    expandHandler: (facetKey: string, expand: boolean) => void;
    facet: {code: string, label: string, values: FacetValue[]};
    facetKey: string;
    isExpanded: boolean;
    nbDefaultDataList: number;
    selectedDataKey: string | undefined;
    selectHandler: (facetKey: string, dataKey: string | undefined, data: FacetValue | undefined) => void;
}

@autobind
@observer
export class Facet extends React.Component<FacetProps, void> {

    @observable private isExpanded: boolean;
    @observable private isShowAll = false;

    private facetDataSelectionHandler(dataKey: string, data: FacetValue) {
        this.props.expandHandler(this.props.facetKey, false);
        this.props.selectHandler(this.props.facetKey, dataKey, data);
    }

    private facetTitleClickHandler() {
        this.props.expandHandler(this.props.facetKey, !this.props.isExpanded);
        if (this.props.selectedDataKey) {
            this.props.selectHandler(this.props.facetKey, undefined, undefined);
        }
        this.isExpanded = !this.props.isExpanded;
        this.isShowAll = false;
    }

    private showAllHandler() {
        this.isShowAll = !this.isShowAll;
    }

    private renderFacetTitle() {
        let title = translate("live.filter.facets." + this.props.facetKey); // Default facet translation path is live.filter.facets.
        if (this.props.selectedDataKey) {
            const selectedFacet = this.props.facet.values.filter(value => value.code === this.props.selectedDataKey);
            const facetLabel = selectedFacet.length ? selectedFacet[0].label : "";
            title = `${title} : ${facetLabel}`;
        }

        return (
            <div data-focus="facet-title" onClick={this.facetTitleClickHandler}>
                <h3>{title}</h3>
            </div>
        );
    }

    private renderShowAllDataList() {
        if (!this.isShowAll && this.props.facet.values.length > this.props.nbDefaultDataList) {
            return (
                <a href="javascript:void(0);" data-focus="facet-show-all" onClick={this.showAllHandler}>
                    {translate("show.all")}
                </a>
            );
        } else {
            return null;
        }
    }

    private renderFacetDataList() {
        if (!this.props.isExpanded || this.props.selectedDataKey) {
            return null;
        }

        const facetValues = this.isShowAll ? this.props.facet.values : this.props.facet.values.slice(0, this.props.nbDefaultDataList);
        return (
            <div data-focus="facet-data-list">
                <ul>
                    {facetValues.map(facetValue => {
                        return (
                            <li key={uniqueId("facet-item")}>
                                <FacetData
                                    dataKey={facetValue.code}
                                    data={facetValue}
                                    selectHandler={this.facetDataSelectionHandler}
                                />
                            </li>
                        );
                    })}
                </ul>
                <div data-focus="facet-data-show-all">
                    {this.renderShowAllDataList()}
                </div>
            </div>
        );
    }

    render() {
        let className = "facet";
        if (this.props.selectedDataKey) {
            className += "-selected";
        } else if (this.props.isExpanded) {
            className += "-expanded";
        } else {
            className += "-collapsed";
        }
        return (
            <div className={className} data-focus="facet">
                {this.renderFacetTitle()}
                {this.renderFacetDataList()}
            </div>
        );
    }
};
