import i18next from "i18next";
import React from "react";

import {useTheme} from "../theme";

import {Checkbox} from "./checkbox";

import * as styles from "./__style__/select-checkbox.css";
export type SelectCheckboxStyle = Partial<typeof styles>;

function clickHandlerFactory(
    isDisabled: boolean,
    isSelected: boolean,
    value: string[] | number[] | undefined,
    optVal: string | number,
    onChange: (value: string[] | number[] | undefined) => void
) {
    return (e: React.SyntheticEvent<any>) => {
        e.stopPropagation();
        e.preventDefault();

        if (!isDisabled) {
            if (isSelected) {
                // is selected -> remove it
                onChange(value ? (value as any).filter((val: any) => val !== optVal) : undefined);
            } else {
                // is not selected -> add it
                onChange((value ? [...value, optVal] : [optVal]) as any);
            }
        }
    };
}

export interface SelectCheckboxProps {
    /** Disabled checkbox-select. */
    disabled?: boolean;
    /** Error message to display. */
    error?: string;
    /** Label to display. */
    label?: string;
    /** Name of field for label. */
    labelKey: string;
    /** Max number of selected items. */
    maxSelectable?: number;
    /** Name for input field. */
    name: string;
    /** Call with each value change. */
    onChange: (value: string[] | number[] | undefined) => void;
    /** CSS. */
    theme?: SelectCheckboxStyle;
    /** Value. */
    value?: string[] | number[];
    /** Name of field for key. */
    valueKey: string;
    /** Values. */
    values: {}[];
}

export function SelectCheckbox({
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
}: SelectCheckboxProps) {
    const theme = useTheme("selectCheckbox", styles, pTheme);
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
