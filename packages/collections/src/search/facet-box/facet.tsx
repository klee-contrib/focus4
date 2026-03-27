import {action} from "mobx";
import {useObserver} from "mobx-react";
import {useTranslation} from "react-i18next";

import {CollectionStore, FacetOutput} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Button, Checkbox, IconButton} from "@focus4/toolbox";

import facetCss from "../__style__/facet.css";
import type {FacetCss} from "../__style__/facet.css.d.ts";

export {facetCss};
export type {FacetCss};

export type FacetState = "collapsed" | "opened" | "expanded";

/** Props de Facet. */
export interface FacetProps {
    /** Facette à afficher. */
    facet: FacetOutput;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataList: number;
    /** Etat de la facette. */
    state: FacetState;
    /** Store. */
    store: CollectionStore;
    /** Toggle pour le bouton "Voir plus". */
    toggleExpand: () => void;
    /** Toggle pour plier/déplier la facette */
    toggleOpen: () => void;
    /** CSS. */
    theme?: CSSProp<FacetCss>;
}

/** Composant affichant le détail d'une facette avec ses valeurs. */
export function Facet({
    facet,
    i18nPrefix = "focus",
    nbDefaultDataList = 6,
    state,
    store,
    toggleExpand,
    toggleOpen,
    theme: pTheme
}: FacetProps) {
    const {t} = useTranslation();
    const theme = useTheme("facet", facetCss, pTheme);

    return useObserver(() => {
        const inputFacet = store.inputFacets[facet.code];
        const count = (inputFacet?.selected?.length ?? 0) + (inputFacet?.excluded?.length ?? 0);

        // Si la facette n'est pas multi-sélectionnable et a une valeur sélectionnée, alors on n'affiche que celle-ci.
        let values = facet.values.filter(
            f =>
                facet.isMultiSelectable ||
                count === 0 ||
                (count > 0 &&
                    ((inputFacet?.selected?.includes(f.code) ?? false) ||
                        (inputFacet?.excluded?.includes(f.code) ?? false)))
        );

        if (state !== "expanded") {
            values = values.slice(0, nbDefaultDataList);
        }

        return (
            <div className={theme.facet()} data-facet={facet.code}>
                <h4 onClick={toggleOpen}>
                    <IconButton
                        icon={{i18nKey: `${i18nPrefix}.icons.facets.${state !== "collapsed" ? "close" : "open"}`}}
                    />
                    {t(facet.label)}
                </h4>
                {state !== "collapsed" ? (
                    <>
                        {facet.isMultiSelectable && facet.isMultiValued ? (
                            <Button
                                color="primary"
                                icon={{i18nKey: `${i18nPrefix}.icons.facets.${inputFacet?.operator ?? "or"}`}}
                                label={t(`${i18nPrefix}.search.facets.${inputFacet?.operator ?? "or"}`)}
                                onClick={() => store.toggleFacetOperator(facet.code)}
                            />
                        ) : null}
                        <ul>
                            {values.map(item => {
                                const selected = !!inputFacet?.selected?.find(sv => sv === item.code);
                                const excluded = !!inputFacet?.excluded?.find(sv => sv === item.code);
                                const clickHandler = action(() => {
                                    if (selected || excluded) {
                                        store.removeFacetValue(facet.code, item.code);
                                    } else {
                                        store.addFacetValue(
                                            facet.code,
                                            item.code,
                                            !facet.isMultiValued && inputFacet?.excluded?.length
                                                ? "excluded"
                                                : "selected"
                                        );
                                    }
                                });
                                return (
                                    <li key={item.code}>
                                        <Checkbox
                                            className={theme.checkbox({selected})}
                                            indeterminate={excluded}
                                            onChange={clickHandler}
                                            value={selected || excluded}
                                        />
                                        <div className={theme.label({excluded})} onClick={clickHandler}>
                                            {t(item.label)}
                                        </div>
                                        <div className={theme.count()}>{item.count}</div>
                                        {facet.canExclude &&
                                        !excluded &&
                                        !selected &&
                                        (facet.isMultiValued ||
                                            (!facet.isMultiValued && !inputFacet?.selected?.length)) ? (
                                            <IconButton
                                                className={theme.icon()}
                                                icon={{i18nKey: `${i18nPrefix}.icons.facets.exclude`}}
                                                onClick={() => store.addFacetValue(facet.code, item.code, "excluded")}
                                            />
                                        ) : facet.canExclude ? (
                                            <IconButton
                                                className={theme.icon()}
                                                disabled
                                                icon={{i18nKey: `${i18nPrefix}.icons.facets.exclude`}}
                                            />
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                        {(facet.isMultiSelectable || count === 0) && facet.values.length > nbDefaultDataList ? (
                            <div className={theme.show()}>
                                <Button
                                    onClick={toggleExpand}
                                    label={t(
                                        state === "expanded"
                                            ? `${i18nPrefix}.list.show.less`
                                            : `${i18nPrefix}.list.show.all`
                                    )}
                                />
                            </div>
                        ) : null}
                    </>
                ) : count > 0 ? (
                    <span>{`(${t(`${i18nPrefix}.search.facets.filter`, {count})})`}</span>
                ) : null}
            </div>
        );
    });
}
