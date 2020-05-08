import i18next from "i18next";
import {useObserver} from "mobx-react";
import * as React from "react";

import {CollectionStore, FacetOutput} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox, ChipTheme} from "@focus4/toolbox";

import {ChipType, SearchChip} from "../chip";
import {addFacetValue, removeFacetValue} from "./utils";

import facetCss, {FacetCss} from "../__style__/facet.css";
export {FacetCss, facetCss};

/** Props de Facet. */
export interface FacetProps {
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
     * @param value La valeur du champ affiché (filtre: `field.value`, facet : `facetItem.code`, inexistant pour sort en group)
     * @returns L'objet de theme, qui sera fusionné avec le theme existant.
     */
    chipThemer?: (type: ChipType, code: string, value?: string) => ChipTheme;
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
export function Facet({
    chipKeyResolver,
    chipThemer,
    facet,
    i18nPrefix = "focus",
    nbDefaultDataList = 6,
    store,
    theme: pTheme
}: FacetProps) {
    const [isShowAll, setIsShowAll] = React.useState(false);
    const theme = useTheme("facet", facetCss, pTheme);
    return useObserver(() => {
        const selectedValues = store.selectedFacets[facet.code] || [];
        const selectedFacet =
            !facet.isMultiSelectable && selectedValues.length === 1
                ? facet.values.find(f => f.code === selectedValues[0])!
                : undefined;
        return (
            <div className={theme.facet({multiSelect: facet.isMultiSelectable})} data-facet={facet.code}>
                <h4>{i18next.t(facet.label)}</h4>
                {selectedFacet ? (
                    <SearchChip
                        key={selectedFacet.code}
                        code={facet.code}
                        codeLabel={facet.label}
                        deletable
                        onDeleteClick={() => removeFacetValue(store, facet.code, selectedFacet.code)}
                        keyResolver={chipKeyResolver}
                        theme={{chip: theme.chip()}}
                        themer={chipThemer}
                        type="facet"
                        value={selectedFacet.code}
                        valueLabel={selectedFacet.label}
                    />
                ) : (
                    <ul>
                        {(isShowAll ? facet.values : facet.values.slice(0, nbDefaultDataList)).map(sfv => {
                            const isSelected = !!selectedValues.find(sv => sv === sfv.code);
                            const clickHandler = (e: React.SyntheticEvent<any>) => {
                                e.stopPropagation();
                                e.preventDefault();
                                (isSelected ? removeFacetValue : addFacetValue)(store, facet.code, sfv.code);
                            };
                            return (
                                <li key={sfv.code} onClick={clickHandler}>
                                    {facet.isMultiSelectable ? (
                                        <Checkbox value={isSelected} onClick={clickHandler} />
                                    ) : null}
                                    <div>{i18next.t(sfv.label)}</div>
                                    <div className={theme.count()}>{sfv.count}</div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                {facet.values.length > nbDefaultDataList ? (
                    <div className={theme.show()} onClick={() => setIsShowAll(!isShowAll)}>
                        {i18next.t(isShowAll ? `${i18nPrefix}.list.show.less` : `${i18nPrefix}.list.show.all`)}
                    </div>
                ) : null}
            </div>
        );
    });
}
