import i18next from "i18next";
import {useObserver} from "mobx-react";
import * as React from "react";

import {CollectionStore, FacetOutput} from "@focus4/stores";
import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import {ChipTheme} from "@focus4/toolbox";

import {ChipType} from "../chip";
import {Facet, FacetCss, facetCss, FacetProps} from "./facet";
import {shouldDisplayFacet} from "./utils";
export {shouldDisplayFacet, FacetProps};

import facetBoxCss, {FacetBoxCss} from "../__style__/facet-box.css";
export {FacetBoxCss, FacetCss, facetBoxCss, facetCss};

/** Props de la FacetBox. */
export interface FacetBoxProps<T> {
    /**
     * Affiche le résultat (si non vide) de cette fonction à la place de la valeur ou de son libellé existant dans les chips.
     * @param type Le type du chip affiché (`filter` ou `facet`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`)
     * @param value La valeur du champ affiché (filtre: `field.value`, facet : `facetItem.code`)
     * @returns Le libellé à utiliser, ou `undefined` s'il faut garder le libellé existant.
     */
    chipKeyResolver?: (type: "filter" | "facet", code: string, value: string) => Promise<string | undefined>;
    /**
     * Passe le style retourné par cette fonction aux chips.
     * @param type Le type du chip affiché (`filter`, `facet`, `sort` ou `group`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`, sort : `store.sortBy`, group : `store.groupingKey`)
     * @param values Les valeurs du champ affiché (filtre: `field.value`, facet : `facetItem.code`, inexistant pour sort en group)
     * @returns L'objet de theme, qui sera fusionné avec le theme existant.
     */
    chipThemer?: (type: ChipType, code: string, values?: string[]) => ChipTheme;
    /** Composant personnalisés pour affichage d'une facette en particulier. */
    customFacetComponents?: {[facet: string]: React.ElementType<FacetProps>};
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataList?: number;
    /**
     * Si renseigné, affiche les facettes dans des sections nommées.
     * Il est possible d'avoir une section qui contient toutes les facettes non renseignées en ne renseignant pas la liste `facets`.
     */
    sections?: {name: string; facets?: string[]}[];
    /** Affiche les facettes qui n'ont qu'une seule valeur. */
    showSingleValuedFacets?: boolean;
    /** Store de recherche associé. */
    store: CollectionStore<T>;
    /** CSS. */
    theme?: CSSProp<FacetBoxCss>;
}

/** Composant contenant la liste des facettes retournées par une recherche. */
export function FacetBox<T>({
    chipKeyResolver,
    chipThemer,
    customFacetComponents = {},
    i18nPrefix = "focus",
    nbDefaultDataList = 6,
    sections,
    showSingleValuedFacets,
    store,
    theme: pTheme
}: FacetBoxProps<T>) {
    const theme = useTheme("facetBox", facetBoxCss, pTheme);

    function renderFacet(facet: FacetOutput) {
        if (store.inputFacets[facet.code] || Object.keys(facet).length > 1) {
            let FacetComponent: React.ElementType<FacetProps> = Facet;

            const FacetCustom = customFacetComponents[facet.code];
            if (FacetCustom) {
                FacetComponent = props => {
                    const facetTheme = useTheme("facet", facetCss);
                    return <FacetCustom {...props} theme={fromBem(facetTheme)} />;
                };
            }

            return (
                <FacetComponent
                    key={facet.code}
                    chipKeyResolver={chipKeyResolver}
                    chipThemer={chipThemer}
                    facet={facet}
                    i18nPrefix={i18nPrefix}
                    nbDefaultDataList={nbDefaultDataList}
                    store={store}
                />
            );
        } else {
            return null;
        }
    }

    return useObserver(() => {
        const filteredFacets = store.facets.filter(
            facet =>
                shouldDisplayFacet(facet, store.inputFacets, showSingleValuedFacets, store.totalCount) &&
                facet.code !== store.groupingKey
        );

        let sectionElements: JSX.Element[] | undefined;
        if (sections) {
            if (sections.filter(s => !s.facets).length > 1) {
                throw new Error("Il ne peut y avoir qu'une seule section de facettes non renseignées.");
            }

            let remainingFacets = [...filteredFacets];

            sectionElements = sections
                .filter(s => !!s.facets && s.facets.length)
                .map(s => {
                    const facets = s
                        .facets!.map(code => {
                            const facet = filteredFacets.find(f => f.code === code);
                            if (facet) {
                                remainingFacets = remainingFacets.filter(f => facet !== f);
                                return renderFacet(facet);
                            } else {
                                return null;
                            }
                        })
                        .filter(x => x);
                    if (facets.length) {
                        return (
                            <div key={s.name} className={theme.section()}>
                                <h5>{s.name}</h5>
                                {facets}
                            </div>
                        );
                    } else {
                        return null;
                    }
                })
                .filter(x => x) as JSX.Element[];

            const restSection = sections.find(s => !s.facets && !!remainingFacets.length);
            if (restSection) {
                sectionElements.splice(
                    sections.indexOf(restSection),
                    0,
                    <div key={restSection.name} className={theme.section()}>
                        {restSection.name ? <h4>{restSection.name}</h4> : null}
                        {remainingFacets.map(renderFacet)}
                    </div>
                );
            }
        }

        return (
            <div className={theme.facetBox()}>
                <h3>{i18next.t(`${i18nPrefix}.search.facets.title`)}</h3>
                {sectionElements || filteredFacets.map(renderFacet)}
            </div>
        );
    });
}
