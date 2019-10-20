import i18next from "i18next";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {FacetOutput, SearchStore} from "@focus4/stores";
import {themr} from "@focus4/styling";
import {Checkbox, ChipTheme} from "@focus4/toolbox";

import {ChipType, SearchChip} from "../chip";
import {addFacetValue, removeFacetValue} from "./utils";

import facetStyles from "../__style__/facet.css";
export type FacetStyle = Partial<typeof facetStyles>;
const Theme = themr("facet", facetStyles);

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
    store: SearchStore;
    /** CSS. */
    theme?: FacetStyle;
}

/** Composant affichant le détail d'une facette avec ses valeurs. */
@observer
export class Facet extends React.Component<FacetProps> {
    @observable protected isShowAll = false;

    protected renderFacetDataList(theme: FacetStyle) {
        const {chipKeyResolver, chipThemer, facet, nbDefaultDataList, store} = this.props;
        const selectedValues = store.selectedFacets[facet.code] || [];

        if (!facet.isMultiSelectable && selectedValues.length === 1) {
            const sfv = facet.values.find(f => f.code === selectedValues[0])!;
            return (
                <SearchChip
                    key={sfv.code}
                    code={facet.code}
                    codeLabel={facet.label}
                    deletable
                    onDeleteClick={() => removeFacetValue(store, facet.code, sfv.code)}
                    keyResolver={chipKeyResolver}
                    theme={{chip: theme.chip}}
                    themer={chipThemer}
                    type="facet"
                    value={sfv.code}
                    valueLabel={sfv.label}
                />
            );
        } else {
            return (
                <ul>
                    {(this.isShowAll ? facet.values : facet.values.slice(0, nbDefaultDataList)).map(sfv => {
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
                                <div className={theme.count}>{sfv.count}</div>
                            </li>
                        );
                    })}
                </ul>
            );
        }
    }

    protected renderShowAllDataList(theme: FacetStyle) {
        const {facet, i18nPrefix = "focus", nbDefaultDataList} = this.props;
        if (facet.values.length > nbDefaultDataList) {
            return (
                <div className={theme.show} onClick={() => (this.isShowAll = !this.isShowAll)}>
                    {i18next.t(this.isShowAll ? `${i18nPrefix}.list.show.less` : `${i18nPrefix}.list.show.all`)}
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        const {facet} = this.props;
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <div
                        className={`${theme.facet} ${facet.isMultiSelectable ? theme.multiSelect : ""}`}
                        data-facet={facet.code}
                    >
                        <h4>{i18next.t(facet.label)}</h4>
                        {this.renderFacetDataList(theme)}
                        {this.renderShowAllDataList(theme)}
                    </div>
                )}
            </Theme>
        );
    }
}
