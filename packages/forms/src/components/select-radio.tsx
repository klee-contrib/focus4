import i18next from "i18next";
import {useObserver} from "mobx-react";
import {ReactNode, useCallback} from "react";

import {ReferenceList} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {RadioButton, RadioGroup} from "@focus4/toolbox";

import selectRadioCss, {SelectRadioCss} from "./__style__/select-radio.css";
export {selectRadioCss, SelectRadioCss};

/** Props du SelectRadio. */
export interface SelectRadioProps<T extends "number" | "string"> {
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: ReactNode;
    /** Libellé. */
    label?: string;
    /** Autorise la non-sélection en ajoutant une option vide. Par défaut : "false". */
    hasUndefined?: boolean;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: (T extends "string" ? string : number) | undefined) => void;
    /** CSS. */
    theme?: CSSProp<SelectRadioCss>;
    /** Type du champ (number ou string). */
    type: T;
    /** Libellé du cas vide. */
    undefinedLabel?: string;
    /** Position du cas vide. Par défaut : "bottom". */
    undefinedPosition?: "bottom" | "top";
    /** Valeur. */
    value: (T extends "string" ? string : number) | undefined;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Un composant de saisie pour choisir un élément dans une liste de référence en utilisant un [`Radio`](components/toolbox.md#radiogroup)
 */
export function SelectRadio<T extends "number" | "string">({
    disabled = false,
    error,
    label,
    hasUndefined = false,
    name,
    onChange,
    theme: pTheme,
    type,
    undefinedLabel = "focus.select.none",
    undefinedPosition = "bottom",
    value,
    values
}: SelectRadioProps<T>) {
    const theme = useTheme("selectRadio", selectRadioCss, pTheme);
    const {$labelKey, $valueKey} = values;

    const handleChange = useCallback(
        (newValue: string) => {
            const v = (type === "number" ? parseFloat(newValue) : newValue) as T extends "string" ? string : number;
            onChange(v || v === 0 ? v : undefined);
        },
        [onChange]
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
            <div className={theme.select()}>
                {label ? <h5 className={theme.title()}>{i18next.t(label)}</h5> : null}
                <RadioGroup disabled={disabled} onChange={handleChange} value={`${value!}`}>
                    {definitiveValues.map(option => {
                        const optVal = option[$valueKey];
                        const optLabel = option[$labelKey];

                        return (
                            <RadioButton
                                key={optVal || "undefined"}
                                label={i18next.t(optLabel)}
                                name={`${name!}-${optVal as string}`}
                                theme={{field: theme.option()}}
                                value={`${optVal as string}`}
                            />
                        );
                    })}
                </RadioGroup>
                {error ? <div className={theme.error()}>{error}</div> : null}
            </div>
        );
    });
}
