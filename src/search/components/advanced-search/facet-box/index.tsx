import {autobind} from "core-decorators";
import {t as translate} from "i18next";
import {omit} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {SearchStore} from "../../../store";
import {InputFacet, FacetValue, StoreFacet} from "../../../types";
import {Facet} from "./facet";

export interface FacetBoxProps {
    openedFacetList: {[facet: string]: boolean};
    store: SearchStore;
    scopesConfig: {[key: string]: string};
}

@autobind
@observer
export class FacetBox extends React.Component<FacetBoxProps, {}> {

    @observable private isExpanded = true;
    @observable private openedFacetList = this.generateOpenedFacetList(this.props.openedFacetList, this.props.store.facets);

    componentWillReceiveProps({store, openedFacetList}: FacetBoxProps) {
        this.openedFacetList = this.generateOpenedFacetList(this.props.openedFacetList, this.props.store.facets);
    }

    private generateOpenedFacetList(openedFacetList: {[facet: string]: boolean}, facetList: StoreFacet[]) {
        if (Object.keys(openedFacetList).length === 0) {
            return facetList.reduce((list, facet) => {
                list[facet.code] = true;
                return list;
            }, {} as {[facet: string]: boolean});
        }

        return openedFacetList;
    }

    private facetBoxTitleClickHandler() {
        this.isExpanded = !this.isExpanded;
    }

    private facetSelectionHandler(facetKey: string, dataKey: string | undefined, data: FacetValue | undefined) {
        const {selectedFacets} = this.props.store;
        const selectedFacetList = (dataKey === undefined ? omit(selectedFacets || {}, facetKey) : Object.assign(selectedFacets || {}, {[facetKey]: {key: dataKey, data: data}})) as {[facet: string]: InputFacet};
        this.onFacetSelection({selectedFacetList});
    }

    private onFacetSelection(facetComponentData: {selectedFacetList: {[facet: string]: InputFacet}}, isDisableGroup?: boolean) {
        const {store} = this.props;
        if (Object.keys(facetComponentData.selectedFacetList).length === 1 && facetComponentData.selectedFacetList["FCT_SCOPE"]) {
            store.setProperties({
                scope: this.props.scopesConfig[facetComponentData.selectedFacetList["FCT_SCOPE"].key]
            });
        } else {
            delete facetComponentData.selectedFacetList["FCT_SCOPE"];
            const newProperties: {selectedFacets: any, groupingKey?: any} = {
                selectedFacets: facetComponentData.selectedFacetList
            };
            if (isDisableGroup) {
                newProperties.groupingKey = undefined;
            }
            store.setProperties(newProperties);
        }
    }

    private facetExpansionHandler(facetKey: string, isExpanded: boolean) {
        this.openedFacetList[facetKey] = isExpanded;
    }

    private renderFacetBoxTitle() {
        const title = this.isExpanded ? translate("live.filter.title") : "";
        return (
            <div data-focus="facet-box-heading" onClick={this.facetBoxTitleClickHandler}>
                <h2>{title}</h2>
            </div>
        );
    }

    private renderFacetList() {
        if (!this.isExpanded) {
            return null;
        }
        const {facets, selectedFacets} = this.props.store;
        return (
            <div data-focus="facet-box-body">
                {facets.map(facet => {
                    let selectedDataKey = (selectedFacets || {})[facet.code] ? (selectedFacets || {})[facet.code].key : undefined;
                    if (selectedDataKey || Object.keys(facet).length > 1) {
                        return (
                            <Facet
                                key={facet.code}
                                facetKey={facet.code}
                                facet={facet}
                                selectedDataKey={selectedDataKey}
                                isExpanded={this.openedFacetList[facet.code]}
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
            <div className={`${this.isExpanded ? "expanded" : "collapsed"}`} data-focus="facet-box">
                {this.renderFacetBoxTitle()}
                {this.renderFacetList()}
            </div>
        );
    }
}
