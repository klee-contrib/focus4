import i18next from "i18next";
import {action, comparer, observable, reaction} from "mobx";
import {useObserver} from "mobx-react";
import {ElementType, MouseEvent, ReactElement, useEffect, useState} from "react";

import {CollectionStore, FacetOutput, FormEntityField} from "@focus4/stores";
import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import {IconButton} from "@focus4/toolbox";

import {Facet, FacetCss, facetCss, FacetProps} from "./facet";
import {shouldDisplayFacet} from "./utils";

import facetBoxCss, {FacetBoxCss} from "../__style__/facet-box.css";

export {facetBoxCss, facetCss, shouldDisplayFacet};
export type {FacetProps, FacetBoxCss, FacetCss};

/** "Facette" additionnelle. */
export interface AdditionalFacet {
    /** Le composant de rendu de la "facette". */
    Component: ElementType<FacetProps>;
    /** Les champs utilisés dans le filtre. Ils seront associés au bouton "clear" de la FacetBox si renseignés. */
    fields?: FormEntityField[];
    /** Valeurs initiales des champs, pour que le "clear" remette les champs à ses valeurs là. */
    initialValues?: any[];
    /** La position à laquelle le composant sera inséré dans la liste des facettes. Si non renseigné, elle sera en premier (0). */
    position?: number;
}

/** Props de la FacetBox. */
export interface FacetBoxProps<T extends object> {
    /** Composants additionnels à afficher dans la FacetBox, pour y intégrer des filtres par exemple.  */
    additionalFacets?: {
        [facet: string]: AdditionalFacet;
    };
    /** Composant personnalisés pour affichage d'une facette en particulier. */
    customFacetComponents?: {[facet: string]: ElementType<FacetProps>};
    /** Facettes pliées par défaut. */
    defaultFoldedFacets?: string[];
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

const noAdditionalFacets = {};

/**
 * Ce composant affiche le résultats des facettes (issues du serveur ou calculées localement) et permet de les sélectionner.
 *
 * Le composant peut être affiché tel quel (à priori sur la gauche des résultats), ou bien à l'intérieur de l'[`ActionBar`](/docs/listes-composants-de-recherche-actionbar--docs) pour des écrans où on n'a pas la place de les afficher sur la gauche.
 *
 * Par défaut, les facettes n'ayant qu'une seule valeur ne sont pas affichées ; il est possible de forcer leur affichage avec la prop `showSingleValuedFacets`.
 */
export function FacetBox<T extends object>({
    additionalFacets = noAdditionalFacets,
    customFacetComponents = {},
    defaultFoldedFacets,
    i18nPrefix = "focus",
    nbDefaultDataList = 6,
    sections,
    showSingleValuedFacets,
    store,
    theme: pTheme
}: FacetBoxProps<T>) {
    const theme = useTheme("facetBox", facetBoxCss, pTheme);
    const facetTheme = useTheme("facet", facetCss);

    // Map pour contrôler les facettes qui sont ouvertes, initialisée une seule fois après le premier chargement du store (le service renvoie toujours toutes les facettes).
    const [openedMap] = useState(() => observable.map<string, boolean>());

    function toggleAll(opened: boolean, forceDefaults: boolean) {
        openedMap.replace(
            store.facets
                .map(facet => [facet.code, forceDefaults && defaultFoldedFacets?.includes(facet.code) ? false : opened])
                .concat(
                    Object.keys(additionalFacets).map(code => [
                        code,
                        forceDefaults && defaultFoldedFacets?.includes(code) ? false : opened
                    ])
                ) as [string, boolean][]
        );
    }

    useEffect(
        () =>
            reaction(
                () => store.facets.map(f => f.code),
                () => toggleAll(true, true),
                {
                    equals: comparer.structural,
                    fireImmediately: true
                }
            ),
        [additionalFacets, store]
    );

    function renderFacet(facet: FacetOutput) {
        const FacetComponent = customFacetComponents[facet.code] ?? additionalFacets[facet.code]?.Component ?? Facet;
        return (
            <FacetComponent
                key={facet.code}
                facet={facet}
                i18nPrefix={i18nPrefix}
                nbDefaultDataList={nbDefaultDataList}
                openedMap={openedMap}
                store={store}
                theme={
                    customFacetComponents[facet.code] ?? additionalFacets[facet.code] ? fromBem(facetTheme) : undefined
                }
            />
        );
    }

    const clearFacets = action((e: MouseEvent<HTMLButtonElement | HTMLLinkElement>) => {
        e.stopPropagation();
        store.removeFacetValue();
        Object.values(additionalFacets).forEach(facet =>
            facet.fields?.forEach((field, idx) => (field.value = facet.initialValues?.[idx]))
        );
    });

    return useObserver(() => {
        const facets = store.facets.slice();

        Object.entries(additionalFacets).forEach(([code, def]) => {
            facets.splice(def.position ?? 0, 0, {
                code,
                label: code,
                canExclude: false,
                isMultiSelectable: false,
                isMultiValued: false,
                values: []
            });
        });

        const filteredFacets = facets.filter(
            facet =>
                facet.code in additionalFacets ||
                (shouldDisplayFacet(facet, store.inputFacets, showSingleValuedFacets, store.totalCount) &&
                    facet.code !== store.groupingKey)
        );

        let sectionElements: ReactElement[] | undefined;
        if (sections) {
            if (sections.filter(s => !s.facets).length > 1) {
                throw new Error("Il ne peut y avoir qu'une seule section de facettes non renseignées.");
            }

            let remainingFacets = [...filteredFacets];

            sectionElements = sections
                .filter(s => !!s.facets && s.facets.length)
                .map(s => {
                    const fs = s
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
                    if (fs.length) {
                        return (
                            <div key={s.name} className={theme.section()}>
                                <h5>{s.name}</h5>
                                {fs}
                            </div>
                        );
                    } else {
                        return null;
                    }
                })
                .filter(x => x) as ReactElement[];

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

        const shouldDisplayClear =
            Object.values(store.inputFacets).some(l => l.selected ?? l.excluded) ||
            Object.values(additionalFacets).some(({fields = [], initialValues = []}) =>
                fields.some((field, idx) => field.value !== initialValues[idx])
            );

        return (
            <div className={theme.facetBox()}>
                <h3 onClick={() => toggleAll(!opened, false)}>
                    <IconButton icon={{i18nKey: `${i18nPrefix}.icons.facets.${opened ? "close" : "open"}`}} />
                    <span>{i18next.t(`${i18nPrefix}.search.facets.title`)}</span>
                    {shouldDisplayClear ? (
                        <IconButton icon={{i18nKey: `${i18nPrefix}.icons.searchBar.clear`}} onClick={clearFacets} />
                    ) : null}
                </h3>
                {sectionElements ?? filteredFacets.map(renderFacet)}
            </div>
        );
    });
}
