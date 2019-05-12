import i18next from "i18next";
import React from "react";
import {RadioButton, RadioGroup} from "react-toolbox/lib/radio";

import {useTheme} from "styling/src/theme";

import * as styles from "./__style__/select-radio.css";
export type SelectRadioStyle = Partial<typeof styles>;

/** Props du SelectRadio. */
export interface SelectRadioProps<T extends "string" | "number"> {
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: React.ReactNode;
    /** Libellé. */
    label?: string;
    /** Autorise la non-sélection en ajoutant une option vide. Par défaut : "false". */
    hasUndefined?: boolean;
    /** Nom du champ de libellé. */
    labelKey: string;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: (T extends "string" ? string : number) | undefined) => void;
    /** CSS. */
    theme?: SelectRadioStyle;
    /** Type du champ (number ou string). */
    type: T;
    /** Libellé du cas vide. */
    undefinedLabel?: string;
    /** Position du cas vide. Par défaut : "bottom". */
    undefinedPosition?: "top" | "bottom";
    /** Valeur. */
    value: (T extends "string" ? string : number) | undefined;
    /** Nom du champ de valeur. */
    valueKey: string;
    /** Liste des valeurs. */
    values: {}[];
}

/** RadioSelect component */
export function SelectRadio<T extends "string" | "number">({
    disabled = false,
    error,
    label,
    labelKey,
    hasUndefined = false,
    name,
    onChange,
    theme: pTheme,
    undefinedLabel = "focus.select.none",
    undefinedPosition = "bottom",
    value,
    valueKey,
    values
}: SelectRadioProps<T>) {
    const theme = useTheme("selectRadio", styles, pTheme);

    let definitiveValues = values;
    if (hasUndefined && undefinedPosition === "bottom") {
        definitiveValues = [...values, {[valueKey]: undefined, [labelKey]: undefinedLabel}];
    }
    if (hasUndefined && undefinedPosition === "top") {
        definitiveValues = [{[valueKey]: undefined, [labelKey]: undefinedLabel}, ...values];
    }

    return (
        <div className={theme.select}>
            {label && <h5 className={theme.title}>{i18next.t(label)}</h5>}
            <RadioGroup name={name} value={value} onChange={onChange} disabled={disabled}>
                {definitiveValues.map(option => {
                    const optVal = (option as any)[valueKey];
                    const optLabel = (option as any)[labelKey];

                    return (
                        <RadioButton
                            key={optVal || "undefined"}
                            label={i18next.t(optLabel)}
                            value={optVal}
                            theme={{field: theme.option}}
                        />
                    );
                })}
            </RadioGroup>
            {error ? <div>{error}</div> : null}
        </div>
    );
}
