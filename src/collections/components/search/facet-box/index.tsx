import i18next from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {ChipTheme} from "react-toolbox/lib/chip";

import {themr} from "../../../../theme";

import {FacetOutput, SearchStore} from "../../../store";
import {ChipType} from "../chip";
import {Facet, FacetProps, FacetStyle, FacetTheme} from "./facet";
import {addFacetValue, removeFacetValue, shouldDisplayFacet} from "./utils";
export {addFacetValue, removeFacetValue, shouldDisplayFacet, FacetProps, FacetStyle};

import * as styles from "./__style__/facet-box.css";
export type FacetBoxStyle = Partial<typeof styles>;
const Theme = themr("facetBox", styles);

/** Props de la FacetBox. */
export interface FacetBoxProps<T> {
    /** Affiche le résultat (si non vide) de cette fonction à la place de la valeur ou de son libellé existant dans les chips. */
    chipKeyResolver?: (type: ChipType, code: string, value: string) => Promise<string | undefined>;
    /** Passe le style retourné par cette fonction aux chips. */
    chipThemer?: (type: ChipType, code: string, value?: string) => ChipTheme;
    /** Composant personnalisés pour affichage d'une facette en particulier. */
    customFacetComponents?: {[facet: string]: React.ReactType<FacetProps>};
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
    store: SearchStore<T>;
    /** CSS. */
    theme?: FacetBoxStyle;
}

/** Composant contenant la liste des facettes retournées par une recherche. */
@observer
export class FacetBox<T> extends React.Component<FacetBoxProps<T>> {
    renderFacet = (facet: FacetOutput) => {
        const {
            chipKeyResolver,
            chipThemer,
            customFacetComponents = {},
            i18nPrefix = "focus",
            nbDefaultDataList = 6,
            store
        } = this.props;
        if (store.selectedFacets[facet.code] || Object.keys(facet).length > 1) {
            let FacetComponent: React.ReactType<FacetProps> = Facet;

            const FacetCustom = customFacetComponents[facet.code];
            if (FacetCustom) {
                FacetComponent = props => <FacetTheme>{theme => <FacetCustom {...props} theme={theme} />}</FacetTheme>;
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
    };

    render() {
        const {i18nPrefix = "focus", store, showSingleValuedFacets} = this.props;
        const {sections} = this.props;

        return (
            <Theme theme={this.props.theme}>
                {theme => {
                    const filteredFacets = store.facets.filter(facet =>
                        shouldDisplayFacet(facet, store.selectedFacets, showSingleValuedFacets, store.totalCount)
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
                                            return this.renderFacet(facet);
                                        } else {
                                            return null;
                                        }
                                    })
                                    .filter(x => x);
                                if (facets.length) {
                                    return (
                                        <div key={s.name} className={theme.section}>
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
                                <div key={restSection.name} className={theme.section}>
                                    {restSection.name ? <h4>{restSection.name}</h4> : null}
                                    {remainingFacets.map(this.renderFacet)}
                                </div>
                            );
                        }
                    }

                    return (
                        <div className={theme.facetBox}>
                            <h3>{i18next.t(`${i18nPrefix}.search.facets.title`)}</h3>
                            {sectionElements || filteredFacets.map(this.renderFacet)}
                        </div>
                    );
                }}
            </Theme>
        );
    }
}
