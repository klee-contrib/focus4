import i18next from "i18next";
import {action, comparer, observable, reaction} from "mobx";
import {useObserver} from "mobx-react";
import * as React from "react";

import {CollectionStore, FacetOutput} from "@focus4/stores";
import {CSSProp, fromBem, getIcon, useTheme} from "@focus4/styling";
import {IconButton} from "@focus4/toolbox";

import {Facet, FacetCss, facetCss, FacetProps} from "./facet";
import {shouldDisplayFacet} from "./utils";
export {shouldDisplayFacet, FacetProps};

import facetBoxCss, {FacetBoxCss} from "../__style__/facet-box.css";
export {FacetBoxCss, FacetCss, facetBoxCss, facetCss};

/** Props de la FacetBox. */
export interface FacetBoxProps<T> {
    /** Composant personnalisés pour affichage d'une facette en particulier. */
    customFacetComponents?: {[facet: string]: React.ElementType<FacetProps>};
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataList?: number;
    /** Appelé au clear des facettes. */
    onClear?: () => void;
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
    customFacetComponents = {},
    i18nPrefix = "focus",
    nbDefaultDataList = 6,
    onClear,
    sections,
    showSingleValuedFacets,
    store,
    theme: pTheme
}: FacetBoxProps<T>) {
    const theme = useTheme("facetBox", facetBoxCss, pTheme);
    const facetTheme = useTheme("facet", facetCss);

    // Map pour contrôler les facettes qui sont ouvertes, initialisée une seule fois après le premier chargement du store (le service renvoie toujours toutes les facettes).
    const [openedMap] = React.useState(() => observable.map<string, boolean>());
    React.useEffect(
        () =>
            reaction(
                () => store.facets.map(f => f.code),
                () => openedMap.replace(store.facets.map(facet => [facet.code, true])),
                {equals: comparer.structural, fireImmediately: true}
            ),
        []
    );

    function renderFacet(facet: FacetOutput) {
        if (store.inputFacets[facet.code] || Object.keys(facet).length > 1) {
            const FacetComponent = customFacetComponents[facet.code] ?? Facet;
            return (
                <FacetComponent
                    key={facet.code}
                    facet={facet}
                    i18nPrefix={i18nPrefix}
                    nbDefaultDataList={nbDefaultDataList}
                    openedMap={openedMap}
                    store={store}
                    theme={customFacetComponents[facet.code] ? fromBem(facetTheme) : undefined}
                />
            );
        } else {
            return null;
        }
    }

    const clearFacets = action((e: React.SyntheticEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        store.removeFacetValue();
        onClear?.();
    });

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

        const opened = Array.from(openedMap.values()).some(v => v);
        return (
            <div className={theme.facetBox()}>
                <h3 onClick={() => openedMap.replace(store.facets.map(facet => [facet.code, !opened]))}>
                    <IconButton icon={getIcon(`${i18nPrefix}.icons.facets.${opened ? "close" : "open"}`)} />
                    <span>{i18next.t(`${i18nPrefix}.search.facets.title`)}</span>
                    {Object.values(store.inputFacets).some(l => l.selected || l.excluded) ? (
                        <IconButton onClick={clearFacets} icon={getIcon(`${i18nPrefix}.icons.searchBar.clear`)} />
                    ) : null}
                </h3>
                {sectionElements || filteredFacets.map(renderFacet)}
            </div>
        );
    });
}
