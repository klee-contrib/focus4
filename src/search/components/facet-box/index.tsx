import {autobind} from "core-decorators";
import i18n from "i18next";
import {omit, values} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {SearchStore} from "../../store";
import {FacetOutput} from "../../types";
import Facet, {FacetStyle} from "./facet";
export {FacetStyle};

import * as styles from "./__style__/facet-box.css";
export type FacetBoxStyle = Partial<typeof styles>;

export interface FacetBoxProps {
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    /** Par défaut : 6 */
    nbDefaultDataList?: number;
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    showSingleValuedFacets?: boolean;
    store: SearchStore<any>;
    theme?: FacetBoxStyle;
}

@autobind
@observer
export class FacetBox extends React.Component<FacetBoxProps, void> {

    private facetSelectionHandler(facetKey: string, dataKey: string | undefined) {
        const {scopeFacetKey = "FCT_SCOPE", store} = this.props;
        let {selectedFacets} = store;

        if (!dataKey) {
            selectedFacets = omit(selectedFacets, facetKey) as typeof selectedFacets;
        } else {
            selectedFacets = {...selectedFacets, [facetKey]: dataKey};
        }

        if (Object.keys(selectedFacets).length === 1 && selectedFacets[scopeFacetKey]) {
            store.scope = selectedFacets[scopeFacetKey];
        } else {
            delete selectedFacets[scopeFacetKey];
            store.selectedFacets = selectedFacets;
        }
    }
    render() {
        const {theme, i18nPrefix = "focus", nbDefaultDataList = 6, showSingleValuedFacets, store: {facets, selectedFacets}} = this.props;
        return (
            <div className={theme!.facetBox!}>
                <h3>{i18n.t(`${i18nPrefix}.search.facets.title`)}</h3>
                {facets.filter(facet => shouldDisplayFacet(facet, selectedFacets, showSingleValuedFacets)).map(facet => {
                    if (selectedFacets[facet.code] || Object.keys(facet).length > 1) {
                        return (
                            <Facet
                                key={facet.code}
                                facet={facet}
                                i18nPrefix={i18nPrefix}
                                selectedDataKey={selectedFacets[facet.code]}
                                selectHandler={this.facetSelectionHandler}
                                nbDefaultDataList={nbDefaultDataList}
                            />
                        );
                    } else {
                        return null;
                    }
                })}
            </div>
        );
    }
}

export default themr("facetBox", styles)(FacetBox);

export function shouldDisplayFacet(facet: FacetOutput, selectedFacets: {[key: string]: string}, showSingleValuedFacets?: boolean) {
    return !(!facet.values.length || !showSingleValuedFacets && facet.values.length === 1 && !values(selectedFacets).find(v => facet.values[0].code === v));
}
