import {autobind} from "core-decorators";
import i18next from "i18next";
import {omit, values} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {FacetOutput, SearchStore} from "../../../store";
import Facet, {FacetStyle} from "./facet";
export {FacetStyle};

import * as styles from "./__style__/facet-box.css";
export type FacetBoxStyle = Partial<typeof styles>;

/** Props de la FacetBox. */
export interface FacetBoxProps<T> {
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataList?: number;
    /** Affiche les facettes qui n'ont qu'une seule valeur. */
    showSingleValuedFacets?: boolean;
    /** Store de recherche associé. */
    store: SearchStore<T>;
    /** CSS. */
    theme?: FacetBoxStyle;
}

/** Composant contenant la liste des facettes retournées par une recherche. */
@autobind
@observer
export class FacetBox<T> extends React.Component<FacetBoxProps<T>, void> {

    protected facetSelectionHandler(facetKey: string, dataKey: string | undefined) {
        const {store} = this.props;

        if (!dataKey) {
            store.selectedFacets = omit(store.selectedFacets, facetKey);
        } else {
            store.selectedFacets = {...store.selectedFacets, [facetKey]: dataKey};
        }
    }

    render() {
        const {theme, i18nPrefix = "focus", nbDefaultDataList = 6, showSingleValuedFacets, store: {facets, selectedFacets}} = this.props;
        return (
            <div className={theme!.facetBox}>
                <h3>{i18next.t(`${i18nPrefix}.search.facets.title`)}</h3>
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

/** Détermine si on doit affiche une facette dans la FacetBox ou non, pour prévoir combien on va avoir de facettes à afficher au final. */
export function shouldDisplayFacet(facet: FacetOutput, selectedFacets: {[key: string]: string}, showSingleValuedFacets?: boolean) {
    return !(!facet.values.length || !showSingleValuedFacets && facet.values.length === 1 && !values(selectedFacets).find(v => facet.values[0].code === v));
}
