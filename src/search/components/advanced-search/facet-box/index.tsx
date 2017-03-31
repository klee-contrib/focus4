import {autobind} from "core-decorators";
import i18n from "i18next";
import {omit} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle} from "../../../../theming";

import {SearchStore} from "../../../store";
import {FacetOutput} from "../../../types";
import {Facet, FacetStyle} from "./facet";
export {FacetStyle};

import * as styles from "./style/facet-box.css";
export type FacetBoxStyle = Partial<typeof styles>;

export interface FacetBoxProps {
    classNames?: FacetBoxStyle;
    openedFacetList: {[facet: string]: boolean};
    store: SearchStore;
    scopesConfig: {[key: string]: string};
}

@injectStyle("facetBox")
@autobind
@observer
export class FacetBox extends React.Component<FacetBoxProps, void> {

    @observable private isExpanded = true;
    @observable private openedFacetList = generateOpenedFacetList(this.props.openedFacetList, this.props.store.facets);

    componentWillReceiveProps({store, openedFacetList}: FacetBoxProps) {
        this.openedFacetList = generateOpenedFacetList(openedFacetList, store.facets);
    }

    private facetBoxTitleClickHandler() {
        this.isExpanded = !this.isExpanded;
    }

    private facetSelectionHandler(facetKey: string, dataKey: string | undefined) {
        let {selectedFacets = {}} = this.props.store;
        if (!dataKey) {
            selectedFacets = omit(selectedFacets, facetKey) as typeof selectedFacets;
        } else {
            selectedFacets = {...selectedFacets, [facetKey]: dataKey};
        }
        this.onFacetSelection(selectedFacets);
    }

    private onFacetSelection(selectedFacets: {[facet: string]: string}) {
        const {store, scopesConfig} = this.props;
        if (Object.keys(selectedFacets).length === 1 && selectedFacets["FCT_SCOPE"]) {
            store.setProperties({scope: scopesConfig[selectedFacets["FCT_SCOPE"]]});
        } else {
            delete selectedFacets["FCT_SCOPE"];
            store.setProperties({selectedFacets});
        }
    }

    private facetExpansionHandler(facetKey: string, isExpanded: boolean) {
        this.openedFacetList[facetKey] = isExpanded;
    }

    private renderFacetBoxTitle() {
        const title = this.isExpanded ? i18n.t("search.facets.title") : "";
        return (
            <div className={`${styles.heading} ${this.props.classNames!.heading || ""}`} onClick={this.facetBoxTitleClickHandler}>
                <h2>{title}</h2>
            </div>
        );
    }

    private renderFacetList() {
        if (!this.isExpanded) {
            return null;
        }
        const {facets, selectedFacets = {}} = this.props.store;
        return (
            <div>
                {facets.map(facet => {
                    if (selectedFacets[facet.code] || Object.keys(facet).length > 1) {
                        return (
                            <Facet
                                key={facet.code}
                                facetKey={facet.code}
                                facet={facet}
                                selectedDataKey={selectedFacets[facet.code]}
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
        const {expanded, collapsed, facetBox} = this.props.classNames!;
        return (
            <div className={`${styles.facetBox} ${facetBox || ""}${this.isExpanded ? `${styles.expanded} ${expanded}` : `${styles.collapsed} ${collapsed}`}`}>
                {this.renderFacetBoxTitle()}
                {this.renderFacetList()}
            </div>
        );
    }
}

function generateOpenedFacetList(openedFacetList: {[facet: string]: boolean}, facetList: FacetOutput[]) {
    if (Object.keys(openedFacetList).length === 0) {
        return facetList.reduce((list, facet) => {
            list[facet.code] = true;
            return list;
        }, {} as {[facet: string]: boolean});
    }

    return openedFacetList;
}
