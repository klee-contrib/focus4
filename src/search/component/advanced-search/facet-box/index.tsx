import {autobind} from "core-decorators";
import {omit} from "lodash";
import * as React from "react";

import {translate} from "../../../../translation";

import {SearchAction} from "../../../action-builder";
import {AdvancedSearch} from "../../../store/advanced-search";
import {InputFacet, FacetValue, StoreFacet} from "../../../types";
import {Facet} from "./facet";

export interface FacetBoxProps {
    facetList: StoreFacet[] | undefined;
    openedFacetList: {[facet: string]: boolean};
    selectedFacetList: {[facet: string]: InputFacet};
    action: SearchAction;
    scopesConfig: {[key: string]: string};
}

export interface FacetBoxState {
    isExpanded?: boolean;
    openedFacetList?: {[facet: string]: boolean};
}

@autobind
export class FacetBox extends React.Component<FacetBoxProps, FacetBoxState> {
    constructor(props: FacetBoxProps) {
        super(props);
        let {openedFacetList} = this.props;
        if (Object.keys(openedFacetList).length === 0) {
            this.generateOpenedFacetList(this.props.facetList || []);
        }
        this.state = {
            isExpanded: true,
            openedFacetList
        };
    }

    componentWillReceiveProps(nextProps: FacetBoxProps) {
        let openedFacetList = nextProps.openedFacetList;
        if (Object.keys(openedFacetList).length === 0) {
            openedFacetList = this.generateOpenedFacetList(nextProps.facetList || []);
        }
        this.setState({openedFacetList});
    }

    private generateOpenedFacetList(facetList: StoreFacet[]) {
        return facetList.reduce(function (list, facet) {
            list[facet.code] = true;
            return list;
        }, {} as {[facet: string]: boolean});
    }

    private facetBoxTitleClickHandler() {
        this.setState({isExpanded: !this.state.isExpanded});
    }

    private facetSelectionHandler(facetKey: string, dataKey: string | undefined, data: FacetValue | undefined) {
        const selectedFacetList = (dataKey === undefined ? omit(this.props.selectedFacetList, facetKey) : Object.assign(this.props.selectedFacetList, {[facetKey]: {key: dataKey, data: data}})) as {[facet: string]: InputFacet};
        this.onFacetSelection({selectedFacetList});
    }

    private onFacetSelection(facetComponentData: {selectedFacetList: {[facet: string]: InputFacet}}, isDisableGroup?: boolean) {
        if (Object.keys(facetComponentData.selectedFacetList).length === 1 && facetComponentData.selectedFacetList["FCT_SCOPE"]) {
            this.props.action.updateProperties({
                scope: this.props.scopesConfig[facetComponentData.selectedFacetList["FCT_SCOPE"].key]
            });
        } else {
            delete facetComponentData.selectedFacetList["FCT_SCOPE"];
            const newProperties: AdvancedSearch = {
                selectedFacets: facetComponentData.selectedFacetList
            };
            if (isDisableGroup) {
                newProperties.groupingKey = undefined;
            }
            this.props.action.updateProperties(newProperties);
        }
    }

    private facetExpansionHandler(facetKey: string, isExpanded: boolean) {
        const {openedFacetList} = this.state;
        openedFacetList![facetKey] = isExpanded;
        this.setState({openedFacetList});
    }

    private renderFacetBoxTitle() {
        const title = this.state.isExpanded ? translate("live.filter.title") : "";
        return (
            <div data-focus="facet-box-heading" onClick={this.facetBoxTitleClickHandler}>
                <h2>{title}</h2>
            </div>
        );
    }

    private renderFacetList() {
        if (!this.state.isExpanded) {
            return null;
        }
        return (
            <div data-focus="facet-box-body">
                {(this.props.facetList || []).map(facet => {
                    let selectedDataKey = this.props.selectedFacetList[facet.code] ? this.props.selectedFacetList[facet.code].key : undefined;
                    if (selectedDataKey || Object.keys(facet).length > 1) {
                        return (
                            <Facet
                                key={facet.code}
                                facetKey={facet.code}
                                facet={facet}
                                selectedDataKey={selectedDataKey}
                                isExpanded={this.state.openedFacetList![facet.code]}
                                expandHandler={this.facetExpansionHandler}
                                selectHandler={this.facetSelectionHandler}
                                nbDefaultDataList={6}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        );
    }

    render() {
        return (
            <div className={`${this.state.isExpanded ? "expanded" : "collapsed"}`} data-focus="facet-box">
                {this.renderFacetBoxTitle()}
                {this.renderFacetList()}
            </div>
        );
    }
}
