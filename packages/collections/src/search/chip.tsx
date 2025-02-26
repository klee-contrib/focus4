import i18next from "i18next";
import {observable} from "mobx";
import {useObserver} from "mobx-react";
import {useEffect, useState} from "react";

import {CSSProp, themeable} from "@focus4/styling";
import {Chip, ChipCss} from "@focus4/toolbox";

/** Type de Chip pour la recherche. */
export type ChipType = "facet" | "filter" | "group" | "sort";

/** Props du SearchChip. */
export interface SearchChipProps {
    /** Classe CSS à passer au Chip. */
    className?: string;
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
    keyResolver?: (type: "facet" | "filter", code: string, value: unknown) => Promise<string | undefined>;
    /** Appelé au clic sur la suppression. */
    onDeleteClick?: () => void;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** CSS du Chip. */
    theme?: CSSProp<ChipCss>;
    /**
     * Passe le style retourné par cette fonction aux chips.
     * @param type Le type du chip affiché (`filter`, `facet`, `sort` ou `group`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`, sort : `store.sortBy`, group : `store.groupingKey`)
     * @param values Les valeurs du champ affiché (filtre: `field.value`, facet : `facetItem.code`, inexistant pour sort en group)
     * @returns L'objet de theme, qui sera fusionné avec le theme existant.
     */
    themer?: (type: ChipType, code: string, values?: unknown[]) => ChipCss;
    /** Type du chip affiché (`filter`, `facet`, `sort` ou `group`). */
    type: ChipType;
    /** Opérateur à utiliser entre les différentes valeurs. */
    valueOperator?: "and" | "or";
    /** Valeurs et libellés des champs affichés (filtre: `field.value`, facet : `facetItem.code`, inexistant pour sort en group). */
    values?: {code: unknown; label?: string; invert?: boolean}[];
}

/** Chip avec un keyResolver. */
export function SearchChip(props: SearchChipProps) {
    const {
        className,
        code,
        codeLabel,
        deletable,
        onDeleteClick,
        keyResolver,
        i18nPrefix = "focus",
        theme = {},
        themer,
        type,
        valueOperator = "or",
        values
    } = props;
    const [valueLabels] = useState(() => observable.map<unknown, string>());

    useEffect(() => {
        valueLabels.replace(values?.map(value => [value.code, value.label ?? `${value.code as any}`]) ?? {});
        if (keyResolver && values && (type === "facet" || type === "filter")) {
            values.forEach(value => {
                keyResolver(type, code, value.code).then(newValueLabel => {
                    if (newValueLabel) {
                        valueLabels.set(value.code, newValueLabel);
                    }
                });
            });
        }
    }, [values]);

    return useObserver(() => {
        const tCodeLabel = i18next.t(codeLabel);
        const tValueLabel = values
            ?.map(
                value =>
                    `${value.invert ? `${i18next.t(`${i18nPrefix}.search.summary.not`)} ` : ""}"${i18next.t(
                        valueLabels.get(value.code)!
                    )}"`
            )
            .join(` ${i18next.t(`${i18nPrefix}.search.summary.${valueOperator}`)} `);
        return (
            <Chip
                className={className}
                color="light"
                label={!tValueLabel ? tCodeLabel : `${tCodeLabel} : ${tValueLabel}`}
                onDeleteClick={deletable ? onDeleteClick : undefined}
                theme={themeable(
                    theme,
                    themer?.(
                        type,
                        code,
                        values?.map(v => v.code)
                    ) ?? {}
                )}
            />
        );
    });
}
