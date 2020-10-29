import i18next from "i18next";
import {action} from "mobx";
import {useObserver} from "mobx-react";
import * as React from "react";

import {CollectionStore, FacetOutput} from "@focus4/stores";
import {CSSProp, getIcon, useTheme} from "@focus4/styling";
import {Button, IconButton} from "@focus4/toolbox";

import facetCss, {FacetCss} from "../__style__/facet.css";
export {FacetCss, facetCss};

/** Props de Facet. */
export interface FacetProps {
    /** Facette à afficher. */
    facet: FacetOutput;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataList: number;
    /** Store. */
    store: CollectionStore;
    /** CSS. */
    theme?: CSSProp<FacetCss>;
}

/** Composant affichant le détail d'une facette avec ses valeurs. */
export function Facet({facet, i18nPrefix = "focus", nbDefaultDataList = 6, store, theme: pTheme}: FacetProps) {
    const [isShowAll, setIsShowAll] = React.useState(false);
    const theme = useTheme("facet", facetCss, pTheme);
    return useObserver(() => {
        const inputFacet = store.inputFacets[facet.code];
        return (
            <div className={theme.facet()} data-facet={facet.code}>
                <h4>{i18next.t(facet.label)}</h4>
                {facet.isMultiSelectable && facet.isMultiValued ? (
                    <Button
                        primary
                        icon={getIcon(`${i18nPrefix}.icons.facets.${inputFacet?.operator ?? "or"}`)}
                        label={i18next.t(`${i18nPrefix}.search.facets.${inputFacet?.operator ?? "or"}`)}
                        onClick={() => store.toggleFacetOperator(facet.code)}
                    />
                ) : null}
                <ul>
                    {(isShowAll ? facet.values : facet.values.slice(0, nbDefaultDataList)).map(item => {
                        const selected = !!inputFacet?.selected?.find(sv => sv === item.code);
                        const excluded = !!inputFacet?.excluded?.find(sv => sv === item.code);
                        const clickHandler = action(() => {
                            if (selected || excluded) {
                                store.removeFacetValue(facet.code, item.code);
                            } else {
                                store.addFacetValue(
                                    facet.code,
                                    item.code,
                                    !facet.isMultiValued && inputFacet?.excluded?.length ? "excluded" : "selected"
                                );
                            }
                        });
                        return (
                            <li key={item.code}>
                                <IconButton
                                    className={theme.icon({selected})}
                                    icon={getIcon(
                                        `${i18nPrefix}.icons.facets.${
                                            selected ? "selected" : excluded ? "excluded" : "none"
                                        }`
                                    )}
                                    onClick={clickHandler}
                                />
                                <div className={theme.label({excluded})} onClick={clickHandler}>
                                    {i18next.t(item.label)}
                                </div>
                                {facet.canExclude &&
                                !excluded &&
                                !selected &&
                                (facet.isMultiValued || (!facet.isMultiValued && !inputFacet?.selected?.length)) ? (
                                    <IconButton
                                        className={theme.icon()}
                                        icon={getIcon(`${i18nPrefix}.icons.facets.exclude`)}
                                        onClick={() => store.addFacetValue(facet.code, item.code, "excluded")}
                                    />
                                ) : null}
                                {facet.values.length !== 1 ||
                                !inputFacet?.selected ||
                                inputFacet.selected[0] !== item.code ? (
                                    <div className={theme.count()}>{item.count}</div>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
                {facet.values.length > nbDefaultDataList ? (
                    <div className={theme.show()} onClick={() => setIsShowAll(!isShowAll)}>
                        {i18next.t(isShowAll ? `${i18nPrefix}.list.show.less` : `${i18nPrefix}.list.show.all`)}
                    </div>
                ) : null}
            </div>
        );
    });
}
