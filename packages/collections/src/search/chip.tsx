import i18next from "i18next";
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
export function SearchChip(props: SearchChipProps) {
    const {code, codeLabel, deletable, onDeleteClick, keyResolver, showCode, theme = {}, themer, type, value} = props;
    const [valueLabel, setValueLabel] = React.useState(props.valueLabel || value);

    React.useEffect(() => {
        if (keyResolver && value && (type === "facet" || type === "filter")) {
            keyResolver(type, code, value).then(newValueLabel => {
                if (newValueLabel) {
                    setValueLabel(newValueLabel);
                }
            });
        }
    }, []);

    const tCodeLabel = i18next.t(codeLabel);
    const tValueLabel = valueLabel && i18next.t(valueLabel);
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
