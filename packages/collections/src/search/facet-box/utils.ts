import {values} from "lodash";

import {FacetOutput, InputFacets} from "@focus4/stores";

/** Détermine si on doit affiche une facette dans la FacetBox ou non, pour prévoir combien on va avoir de facettes à afficher au final. */
export function shouldDisplayFacet(
    facet: FacetOutput,
    inputFacets: InputFacets,
    showSingleValuedFacets: boolean | undefined,
    totalCount: number
) {
    return !(
        !facet.values.length ||
        (!showSingleValuedFacets &&
            facet.values.length === 1 &&
            facet.values[0].count === totalCount &&
            !values(inputFacets).find(
                vs => !![...(vs.selected ?? []), ...(vs.excluded ?? [])].find(v => facet.values[0].code === v)
            ))
    );
}
