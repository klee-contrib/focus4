import i18next from "i18next";
import {useObserver} from "mobx-react";
import {useCallback} from "react";

import {DomainFieldType, DomainTypeSingle, ReferenceList} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {RadioButton, RadioCss, RadioGroup} from "@focus4/toolbox";

import {stringToDomainType} from "./utils";

import selectRadioCss, {SelectRadioCss} from "./__style__/select-radio.css";
export {selectRadioCss, SelectRadioCss};

/** Props du SelectRadio. */
export interface SelectRadioProps<T extends DomainFieldType> {
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: string;
    /** Libellé. */
    label?: string;
    /** Autorise la non-sélection en ajoutant une option vide. Par défaut : "false". */
    hasUndefined?: boolean;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: DomainTypeSingle<T> | undefined) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<RadioCss & SelectRadioCss>;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Libellé du cas vide. */
    undefinedLabel?: string;
    /** Position du cas vide. Par défaut : "bottom". */
    undefinedPosition?: "bottom" | "top";
    /** Valeur. */
    value?: DomainTypeSingle<T>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Un composant de saisie pour choisir un élément dans une liste de référence en utilisant un [`Radio`](components/toolbox.md#radiogroup)
 */
export function SelectRadio<T extends DomainFieldType>({
    disabled = false,
    error,
    label,
    hasUndefined = false,
    name,
    onChange,
    showSupportingText = "always",
    theme: pTheme,
    type,
    undefinedLabel = "focus.select.none",
    undefinedPosition = "bottom",
    value,
    values
}: SelectRadioProps<T>) {
    const theme = useTheme<RadioCss & SelectRadioCss>("selectRadio", selectRadioCss, pTheme);
    const {$labelKey, $valueKey} = values;

    const handleChange = useCallback(
        (newValue: string) => {
            onChange(stringToDomainType(newValue, type));
        },
        [onChange, type]
    );

    return useObserver(() => {
        let definitiveValues: any[] = values;
        if (hasUndefined && undefinedPosition === "bottom") {
            definitiveValues = [...values.slice(), {[$valueKey]: undefined, [$labelKey]: undefinedLabel}];
        }
        if (hasUndefined && undefinedPosition === "top") {
            definitiveValues = [{[$valueKey]: undefined, [$labelKey]: undefinedLabel}, ...values.slice()];
        }

        return (
            <div className={theme.select({error: !!error})}>
                {label ? <h5 className={theme.title()}>{i18next.t(label)}</h5> : null}
                <RadioGroup disabled={disabled} onChange={handleChange} value={`${value}`}>
                    {definitiveValues.map(option => {
                        const optVal = option[$valueKey];
                        const optLabel = option[$labelKey];

                        return (
                            <RadioButton
                                key={optVal || "undefined"}
                                label={i18next.t(optLabel)}
                                name={`${name!}-${optVal}`}
                                theme={theme}
                                value={optVal?.toString() ?? ""}
                            />
                        );
                    })}
                </RadioGroup>
                {showSupportingText === "always" || (showSupportingText === "auto" && error) ? (
                    <div className={theme.supportingText()}>{error}</div>
                ) : null}
            </div>
        );
    });
}
