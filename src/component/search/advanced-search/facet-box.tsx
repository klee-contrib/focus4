import * as React from "react";
import {autobind} from "core-decorators";
import * as defaults from "../../defaults";
import {SearchAction} from "../../../search/action-builder";
import {InputFacet} from "../../../search/search-action/types";
import {AdvancedSearch} from "../../../store/search/advanced-search";

export interface Props {
    facets?: {};
    selectedFacets?: {[facet: string]: InputFacet};
    facetConfig: {};
    action: SearchAction;
    scopesConfig: {[key: string]: string};
    openedFacetList: {};
}

@autobind
export default class extends React.Component<Props, {}> {

    private onFacetSelection(facetComponentData: {selectedFacetList: {[facet: string]: InputFacet}}, isDisableGroup: boolean) {
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

    render() {
        const {FacetBox} = defaults;
        if (!FacetBox) {
            throw new Error("Le composant FacetBox n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts.");
        }
        return (
            <FacetBox
                data-focus="advanced-search-facet-box"
                facetList={this.props.facets}
                selectedFacetList={this.props.selectedFacets}
                config={this.props.facetConfig}
                openedFacetList={this.props.openedFacetList}
                dataSelectionHandler={this.onFacetSelection}
            />
        );
    }
}
