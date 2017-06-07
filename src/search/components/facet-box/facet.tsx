import {autobind} from "core-decorators";
import i18n from "i18next";
import {uniqueId} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Chips from "focus-components/chips";

import {FacetOutput} from "../../types";

import * as styles from "./__style__/facet.css";
export type FacetStyle = Partial<typeof styles>;

export interface FacetProps {
    facet: FacetOutput;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    nbDefaultDataList: number;
    selectedDataKey: string | undefined;
    selectHandler: (facetKey: string, dataKey: string | undefined) => void;
    theme?: FacetStyle;
}

@autobind
@observer
export class Facet extends React.Component<FacetProps, void> {

    @observable private isShowAll = false;

    private renderFacetDataList() {
        const {theme, selectedDataKey, facet, nbDefaultDataList, selectHandler} = this.props;

        if (selectedDataKey) {
            const selectedFacet = facet.values.filter(value => value.code === selectedDataKey);
            const facetLabel = selectedFacet.length ? selectedFacet[0].label : "";
            return (
                <Chips
                    label={facetLabel}
                    onDeleteClick={() => selectHandler(this.props.facet.code, undefined)}
                />
            );
        }

        const facetValues = this.isShowAll ? facet.values : facet.values.slice(0, nbDefaultDataList);
        return (
            <ul>
                {facetValues.map(facetValue => (
                    <li key={uniqueId("facet-item")} onClick={() => this.props.selectHandler(this.props.facet.code, facetValue.code)}>
                        <div>{i18n.t(facetValue.label)}</div>
                        <div className={theme!.count!}>{facetValue.count}</div>
                    </li>
                ))}
            </ul>
        );
    }

    private renderShowAllDataList() {
        const {theme, facet, i18nPrefix = "focus", nbDefaultDataList} = this.props;
        if (facet.values.length > nbDefaultDataList) {
            return (
                <div className={theme!.show!} onClick={() => this.isShowAll = !this.isShowAll}>
                    {i18n.t(this.isShowAll ? `${i18nPrefix}.list.show.less` : `${i18nPrefix}.list.show.all`)}
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        const {theme, facet} = this.props;
        return (
            <div className={theme!.facet!}>
                <h4>{i18n.t(facet.label)}</h4>
                {this.renderFacetDataList()}
                {this.renderShowAllDataList()}
            </div>
        );
    }
}

export default themr("facet", styles)(Facet);
