import {action, ObservableMap} from "mobx";
import {useObserver} from "mobx-react";
import {useState} from "react";
import {useTranslation} from "react-i18next";

import {CollectionStore, FacetOutput} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Button, Checkbox, IconButton} from "@focus4/toolbox";

import facetCss, {FacetCss} from "../__style__/facet.css";

export {facetCss};
export type {FacetCss};

/** Props de Facet. */
export interface FacetProps {
    /** Facette à afficher. */
    facet: FacetOutput;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataList: number;
    /** Map des états d'ouverture des facettes.  */
    openedMap: ObservableMap<string, boolean>;
    /** Store. */
    store: CollectionStore;
    /** CSS. */
    theme?: CSSProp<FacetCss>;
}

/** Composant affichant le détail d'une facette avec ses valeurs. */
export function Facet({
    facet,
    i18nPrefix = "focus",
    nbDefaultDataList = 6,
    openedMap,
    store,
    theme: pTheme
}: FacetProps) {
    const [isShowAll, setIsShowAll] = useState(false);

    const {t} = useTranslation();
    const theme = useTheme("facet", facetCss, pTheme);

    return useObserver(() => {
        const inputFacet = store.inputFacets[facet.code];
        const count = (inputFacet?.selected?.length ?? 0) + (inputFacet?.excluded?.length ?? 0);
        const opened = openedMap.get(facet.code) ?? false;

        // Si la facette n'est pas multi-sélectionnable et a une valeur sélectionnée, alors on n'affiche que celle-ci.
        let values = facet.values.filter(
            f =>
                facet.isMultiSelectable ||
                count === 0 ||
                (count > 0 &&
                    ((inputFacet?.selected?.includes(f.code) ?? false) ||
                        (inputFacet?.excluded?.includes(f.code) ?? false)))
        );

        if (!isShowAll) {
            values = values.slice(0, nbDefaultDataList);
        }

        return (
            <div className={theme.facet()} data-facet={facet.code}>
                {/* oxlint-disable-next-line click-events-have-key-events */}
                <h4 onClick={() => openedMap.set(facet.code, !opened)}>
                    <IconButton icon={{i18nKey: `${i18nPrefix}.icons.facets.${opened ? "close" : "open"}`}} />
                    {t(facet.label)}
                </h4>
                {opened ? (
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
                                        {/* oxlint-disable-next-line click-events-have-key-events */}
                                        <div className={theme.label({excluded})} onClick={clickHandler}>
                                            {t(item.label)}
                                        </div>
                                        {!(count === 1 && (!facet.isMultiSelectable || facet.values.length === 1)) ? (
                                            <div className={theme.count()}>{item.count}</div>
                                        ) : null}
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
                                    onClick={() => setIsShowAll(!isShowAll)}
                                    label={t(
                                        isShowAll ? `${i18nPrefix}.list.show.less` : `${i18nPrefix}.list.show.all`
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
