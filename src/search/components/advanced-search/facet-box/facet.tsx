import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {uniqueId} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle} from "../../../../theming";

import {FacetData, FacetValue} from "./facet-data";

import * as styles from "./style/facet.css";
export type FacetStyle = typeof styles;

export interface FacetProps {
    classNames?: FacetStyle;
    expandHandler: (facetKey: string, expand: boolean) => void;
    facet: {code: string, label: string, values: FacetValue[]};
    facetKey: string;
    isExpanded: boolean;
    nbDefaultDataList: number;
    selectedDataKey: string | undefined;
    selectHandler: (facetKey: string, dataKey: string | undefined, data: FacetValue | undefined) => void;
}

@injectStyle("facet")
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
        const {facetKey, selectedDataKey, facet, classNames} = this.props;
        let facetTitle = i18n.t("live.filter.facets." + facetKey); // Default facet translation path is live.filter.facets.
        if (selectedDataKey) {
            const selectedFacet = facet.values.filter(value => value.code === selectedDataKey);
            const facetLabel = selectedFacet.length ? selectedFacet[0].label : "";
            facetTitle = `${facetTitle} : ${facetLabel}`;
        }

        return (
            <div className={`${styles.title} ${classNames!.title || ""}`} onClick={this.facetTitleClickHandler}>
                <h3>{facetTitle}</h3>
            </div>
        );
    }

    private renderShowAllDataList() {
        if (!this.isShowAll && this.props.facet.values.length > this.props.nbDefaultDataList) {
            return (
                <a href="javascript:void(0);" onClick={this.showAllHandler}>
                    {i18n.t("show.all")}
                </a>
            );
        } else {
            return null;
        }
    }

    private renderFacetDataList() {
        const {isExpanded, selectedDataKey, facet, nbDefaultDataList, classNames} = this.props;
        if (!isExpanded || selectedDataKey) {
            return null;
        }

        const facetValues = this.isShowAll ? facet.values : facet.values.slice(0, nbDefaultDataList);
        return (
            <div className={`${styles.list} ${classNames!.list}`}>
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
                <div className={`${styles.showAll} ${classNames!.showAll}`}>
                    {this.renderShowAllDataList()}
                </div>
            </div>
        );
    }

    render() {
        const {selectedDataKey, isExpanded, classNames} = this.props;
        return (
            <div className={selectedDataKey ? `${styles.selected} ${classNames!.selected}` : isExpanded ? `${styles.expanded} ${classNames!.expanded}` : `${styles.collapsed} ${classNames!.collapsed}`}>
                {this.renderFacetTitle()}
                {this.renderFacetDataList()}
            </div>
        );
    }
};
