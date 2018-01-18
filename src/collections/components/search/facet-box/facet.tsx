import {autobind} from "core-decorators";
import i18next from "i18next";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {Chip} from "react-toolbox/lib/chip";

import {FacetOutput, SearchStore} from "../../../store";
import {addFacetValue, removeFacetValue} from "./utils";

import * as styles from "./__style__/facet.css";

export type FacetStyle = Partial<typeof styles>;

/** Props de Facet. */
export interface FacetProps {
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
@autobind
@observer
export class Facet extends React.Component<FacetProps, void> {

    @observable protected isShowAll = false;

    protected renderFacetDataList() {
        const {theme, facet, nbDefaultDataList, store} = this.props;

        const selectedFacetValues = facet.values.filter(value => !!(store.selectedFacets[facet.code] || []).find(sv => sv === value.code));
        const unselectedFacetValues = facet.values.filter(value => !selectedFacetValues.find(sfv => sfv.code === value.code));

        return (
            <div>
                {selectedFacetValues.map(sfv => (
                    <Chip
                        key={sfv.code}
                        deletable
                        onClick={() => removeFacetValue(store, facet.code, sfv.code)}
                        theme={{chip: theme!.chip}}
                    >
                        {i18next.t(sfv.label)}
                    </Chip>
                ))}
                <ul>
                    {(this.isShowAll ? unselectedFacetValues : unselectedFacetValues.slice(0, nbDefaultDataList)).map(sfv => (
                        <li key={sfv.code} onClick={() => addFacetValue(store, facet.code, sfv.code)}>
                            <div>{i18next.t(sfv.label)}</div>
                            <div className={theme!.count}>{sfv.count}</div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    protected renderShowAllDataList() {
        const {theme, facet, i18nPrefix = "focus", nbDefaultDataList} = this.props;
        if (facet.values.length > nbDefaultDataList) {
            return (
                <div className={theme!.show} onClick={() => this.isShowAll = !this.isShowAll}>
                    {i18next.t(this.isShowAll ? `${i18nPrefix}.list.show.less` : `${i18nPrefix}.list.show.all`)}
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        const {theme, facet} = this.props;
        return (
            <div className={theme!.facet}>
                <h4>{i18next.t(facet.label)}</h4>
                {this.renderFacetDataList()}
                {this.renderShowAllDataList()}
            </div>
        );
    }
}

export default themr("facet", styles)(Facet);
