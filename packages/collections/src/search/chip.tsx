import i18next from "i18next";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {themeable} from "@focus4/core";
import {Chip, ChipTheme} from "@focus4/toolbox";

/** Type de Chip pour la recherche. */
export type ChipType = "filter" | "facet" | "sort" | "group";

/** Props du SearchChip. */
export interface SearchChipProps {
    /** Code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`, sort : `store.sortBy`, group : `store.groupingKey`). */
    code: string;
    /** Libellé associé au code. */
    codeLabel: string;
    /** Affiche la croix pour la suppression. */
    deletable?: boolean;
    /**
     * Affiche le résultat (si non vide) de cette fonction à la place de la valeur ou de son libellé existant dans les chips.
     * @param type Le type du chip affiché (`filter` ou `facet`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`)
     * @param value La valeur du champ affiché (filtre: `field.value`, facet : `facetItem.code`)
     * @returns Le libellé à utiliser, ou `undefined` s'il faut garder le libellé existant.
     */
    keyResolver?: (type: "filter" | "facet", code: string, value: string) => Promise<string | undefined>;
    /** Appelé au clic sur la suppression. */
    onDeleteClick?: () => void;
    /** Affiche le code en plus de la valeur. */
    showCode?: boolean;
    /** CSS du Chip. */
    theme?: ChipTheme;
    /**
     * Passe le style retourné par cette fonction aux chips.
     * @param type Le type du chip affiché (`filter`, `facet`, `sort` ou `group`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`, sort : `store.sortBy`, group : `store.groupingKey`)
     * @param value La valeur du champ affiché (filtre: `field.value`, facet : `facetItem.code`, inexistant pour sort en group)
     * @returns L'objet de theme, qui sera fusionné avec le theme existant.
     */
    themer?: (type: ChipType, code: string, value?: string) => ChipTheme;
    /** Type du chip affiché (`filter`, `facet`, `sort` ou `group`). */
    type: ChipType;
    /** Valeur du champ affiché (filtre: `field.value`, facet : `facetItem.code`, inexistant pour sort en group). */
    value?: string;
    /** Libellé associé à la valeur. */
    valueLabel?: string;
}

/** Chip avec un keyResolver. */
@observer
export class SearchChip extends React.Component<SearchChipProps> {
    @observable valueLabel = this.props.valueLabel || this.props.value;

    async componentDidMount() {
        const {code, keyResolver, type, value} = this.props;
        if (keyResolver && value && (type === "facet" || type === "filter")) {
            const valueLabel = await keyResolver(type, code, value);
            if (valueLabel) {
                this.valueLabel = valueLabel;
            }
        }
    }

    render() {
        const {code, codeLabel, deletable, onDeleteClick, showCode, theme = {}, themer, type, value} = this.props;
        const tCodeLabel = i18next.t(codeLabel);
        const tValueLabel = this.valueLabel && i18next.t(this.valueLabel);
        return (
            <Chip
                deletable={deletable}
                onDeleteClick={onDeleteClick}
                theme={themeable(theme, (themer && themer(type, code, value)) || {})}
            >
                {!tValueLabel ? tCodeLabel : showCode ? `${tCodeLabel} : ${tValueLabel}` : tValueLabel}
            </Chip>
        );
    }
}
