import {autobind} from "core-decorators";
import i18next from "i18next";
import {uniqueId} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {Chip} from "react-toolbox/lib/chip";

import {FacetOutput} from "../../types";

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
    /** Valeur sélectionnée. */
    selectedDataKey: string | undefined;
    /** Handler de sélection d'une facette. */
    selectHandler: (facetKey: string, dataKey: string | undefined) => void;
    /** CSS. */
    theme?: FacetStyle;
}

/** Composant affichant le détail d'une facette avec ses valeurs. */
@autobind
@observer
export class Facet extends React.Component<FacetProps, void> {

    @observable protected isShowAll = false;

    protected renderFacetDataList() {
        const {theme, selectedDataKey, facet, nbDefaultDataList, selectHandler} = this.props;

        if (selectedDataKey) {
            const selectedFacet = facet.values.filter(value => value.code === selectedDataKey);
            return (
                <Chip
                    deletable
                    onClick={() => selectHandler(this.props.facet.code, undefined)}
                    theme={{chip: theme!.chip}}
                >
                    {selectedFacet.length ? i18next.t(selectedFacet[0].label) : ""}
                </Chip>
            );
        }

        const facetValues = this.isShowAll ? facet.values : facet.values.slice(0, nbDefaultDataList);
        return (
            <ul>
                {facetValues.map(facetValue => (
                    <li key={uniqueId("facet-item")} onClick={() => this.props.selectHandler(this.props.facet.code, facetValue.code)}>
                        <div>{i18next.t(facetValue.label)}</div>
                        <div className={theme!.count}>{facetValue.count}</div>
                    </li>
                ))}
            </ul>
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
