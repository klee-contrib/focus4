import i18next from "i18next";
import * as React from "react";

import {CSSToStrings, useTheme} from "@focus4/styling";
import {Checkbox} from "@focus4/toolbox";

import selectCheckboxStyles, {SelectCheckboxCss} from "./__style__/select-checkbox.css";
export {selectCheckboxStyles};
export type SelectCheckboxStyle = CSSToStrings<SelectCheckboxCss>;

function clickHandlerFactory(
    isDisabled: boolean,
    isSelected: boolean,
    value: any[] | undefined,
    optVal: string | number,
    onChange: (value: any[] | undefined) => void
) {
    return (e: React.SyntheticEvent<any>) => {
        e.stopPropagation();
        e.preventDefault();

        if (!isDisabled) {
            if (isSelected) {
                // is selected -> remove it
                onChange(value ? value.filter(val => val !== optVal) : undefined);
            } else {
                // is not selected -> add it
                onChange(value ? [...value, optVal] : [optVal]);
            }
        }
    };
}

/** Props du SelectCheckbox */
export interface SelectCheckboxProps<T extends "string" | "number"> {
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: React.ReactNode;
    /** Libellé. */
    label?: string;
    /** Nom du champ de libellé. */
    labelKey: string;
    /** Nombre maximal d'éléments sélectionnables. */
    maxSelectable?: number;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: (T extends "string" ? string : number)[] | undefined) => void;
    /** CSS. */
    theme?: SelectCheckboxStyle;
    /** Type du champ (number ou string). */
    type: T;
    /** Valeur. */
    value: (T extends "string" ? string : number)[] | undefined;
    /** Nom du champ de valeur. */
    valueKey: string;
    /** Liste des valeurs. */
    values: {}[];
}

export function SelectCheckbox<T extends "string" | "number">({
    disabled = false,
    error,
    label,
    labelKey,
    maxSelectable,
    name,
    onChange,
    theme: pTheme,
    value,
    valueKey,
    values
}: SelectCheckboxProps<T>) {
    const theme = useTheme("selectCheckbox", selectCheckboxStyles, pTheme);
    return (
        <div className={theme.select}>
            {label && <h5>{i18next.t(label)}</h5>}
            <ul>
                {values.map(option => {
                    const optVal = (option as any)[valueKey];
                    const optLabel = (option as any)[labelKey];

                    const isSelected = value ? !!(value as any).find((val: any) => optVal === val) : false;
                    const clickHandler = clickHandlerFactory(disabled, isSelected, value, optVal, onChange);

                    return (
                        <li key={optVal} onClick={clickHandler} className={theme!.option}>
                            <Checkbox
                                name={`${name}-${optVal}`}
                                value={isSelected}
                                onClick={clickHandler}
                                disabled={
                                    disabled ||
                                    (maxSelectable !== undefined &&
                                        maxSelectable === (value && value.length) &&
                                        !isSelected)
                                }
                                label={i18next.t(optLabel)}
                            />
                        </li>
                    );
                })}
            </ul>
            {error ? <div>{error}</div> : null}
        </div>
    );
}
