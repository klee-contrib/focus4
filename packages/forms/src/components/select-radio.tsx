import i18next from "i18next";
import {useObserver} from "mobx-react";
import {ReactNode} from "react";

import {ReferenceList} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {RadioButton, RadioGroup} from "@focus4/toolbox";

import selectRadioCss, {SelectRadioCss} from "./__style__/select-radio.css";
export {selectRadioCss, SelectRadioCss};

/** Props du SelectRadio. */
export interface SelectRadioProps<T extends "string" | "number"> {
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
    undefinedPosition?: "top" | "bottom";
    /** Valeur. */
    value: (T extends "string" ? string : number) | undefined;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/** RadioSelect component */
export function SelectRadio<T extends "string" | "number">({
    disabled = false,
    error,
    label,
    hasUndefined = false,
    name,
    onChange,
    theme: pTheme,
    undefinedLabel = "focus.select.none",
    undefinedPosition = "bottom",
    value,
    values
}: SelectRadioProps<T>) {
    const theme = useTheme("selectRadio", selectRadioCss, pTheme);
    const {$labelKey, $valueKey} = values;

    return useObserver(() => {
        let definitiveValues: {}[] = values;
        if (hasUndefined && undefinedPosition === "bottom") {
            definitiveValues = [...values, {[$valueKey]: undefined, [$labelKey]: undefinedLabel}];
        }
        if (hasUndefined && undefinedPosition === "top") {
            definitiveValues = [{[$valueKey]: undefined, [$labelKey]: undefinedLabel}, ...values];
        }

        return (
            <div className={theme.select()}>
                {label && <h5 className={theme.title()}>{i18next.t(label)}</h5>}
                <RadioGroup name={name} value={value} onChange={onChange} disabled={disabled}>
                    {definitiveValues.map(option => {
                        const optVal = (option as any)[$valueKey];
                        const optLabel = (option as any)[$labelKey];

                        return (
                            <RadioButton
                                key={optVal || "undefined"}
                                name={`${name}-${optVal}`}
                                label={i18next.t(optLabel)}
                                value={optVal}
                                theme={{field: theme.option()}}
                            />
                        );
                    })}
                </RadioGroup>
                {error ? <div className={theme.error()}>{error}</div> : null}
            </div>
        );
    });
}
