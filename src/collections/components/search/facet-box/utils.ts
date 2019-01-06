import {omit, uniq, values} from "lodash";
import {FacetOutput, SearchStore} from "../../../store";

/** Ajoute une valeur de facette pour la facette donnée. */
export function addFacetValue(store: SearchStore, facetKey: string, facetValue: string) {
    if (store.selectedFacets[facetKey]) {
        // Liste existante : on ajoute la valeur à la liste (en vérifiant qu'elle n'est pas déjà présente)
        store.selectedFacets = {
            ...store.selectedFacets,
            [facetKey]: uniq(store.selectedFacets[facetKey].concat(facetValue))
        };
    } else {
        // Liste manquante : on crée la liste.
        store.selectedFacets = {...store.selectedFacets, [facetKey]: [facetValue]};
    }
}

/** Retire une valeur de facette pour la facette donnée. */
export function removeFacetValue(store: SearchStore, facetKey: string, facetValue: string) {
    if (store.selectedFacets[facetKey].length === 1) {
        // Une seule valeur sélectionnée : on retire la facette entière.
        store.selectedFacets = omit(store.selectedFacets, facetKey);
    } else {
        // Sinon, on retire simplement la valeur de la liste.
        store.selectedFacets = {
            ...store.selectedFacets,
            [facetKey]: store.selectedFacets[facetKey].filter(value => value !== facetValue)
        };
    }
}

/** Détermine si on doit affiche une facette dans la FacetBox ou non, pour prévoir combien on va avoir de facettes à afficher au final. */
export function shouldDisplayFacet(
    facet: FacetOutput,
    selectedFacets: {[key: string]: string[]},
    showSingleValuedFacets?: boolean
) {
    return !(
        !facet.values.length ||
        (!showSingleValuedFacets &&
            facet.values.length === 1 &&
            !values(selectedFacets).find(vs => !!vs.find(v => facet.values[0].code === v)))
    );
}
