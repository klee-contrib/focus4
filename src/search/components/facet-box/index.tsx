import {autobind} from "core-decorators";
import i18n from "i18next";
import {omit} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle} from "../../../theming";

import {SearchStore} from "../../store";
import {Facet, FacetStyle} from "./facet";
export {FacetStyle};

import * as styles from "./__style__/facet-box.css";
export type FacetBoxStyle = Partial<typeof styles>;

export interface FacetBoxProps {
    classNames?: FacetBoxStyle;
    /** Par défaut : 6 */
    nbDefaultDataList?: number;
    /** Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    store: SearchStore;
}

@injectStyle("facetBox")
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
        const {classNames, nbDefaultDataList = 6, store: {facets, selectedFacets}} = this.props;
        return (
            <div className={`${styles.facetBox} ${classNames!.facetBox || ""}`}>
                <h3>{i18n.t("search.facets.title")}</h3>
                {facets.map(facet => {
                    if (selectedFacets[facet.code] || Object.keys(facet).length > 1) {
                        return (
                            <Facet
                                key={facet.code}
                                facet={facet}
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
