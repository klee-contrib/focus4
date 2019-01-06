import i18next from "i18next";
import React from "react";
import {themr} from "react-css-themr";
import {RadioButton, RadioGroup} from "react-toolbox/lib/radio";

import * as styles from "./__style__/select-radio.css";
export type SelectRadioStyle = Partial<typeof styles>;

/** Props for RadioSelect */
export interface SelectRadioProps {
    /** Disabled radio-select, default to: false */
    disabled?: boolean;
    /** Error message to display. */
    error?: string;
    /** Label to display. */
    label?: string;
    /** Name of field for label. */
    labelKey: string;
    /** Name for input field. */
    name: string;
    /** Call with each value change. */
    onChange: (value: string | number | undefined) => void;
    /** CSS. */
    theme?: SelectRadioStyle;
    /** Value. */
    value?: string | number | undefined;
    /** Name of field for key. */
    valueKey: string;
    /** Values. */
    values: {}[];
    /** If has undefined, default to: false */
    hasUndefined?: boolean;
    /** Undefined label */
    undefinedLabel?: string;
    /** Undefined position, default to: bottom */
    undefinedPosition?: "top" | "bottom";
}

/** RadioSelect component */
export function SelectRadio({
    disabled = false,
    error,
    label,
    labelKey,
    name,
    onChange,
    theme,
    value,
    valueKey,
    values,
    hasUndefined = false,
    undefinedLabel = "focus.select.none",
    undefinedPosition = "bottom"
}: SelectRadioProps) {
    let definitiveValues = values;
    if (hasUndefined && undefinedPosition === "bottom") {
        definitiveValues = [...values, {[valueKey]: undefined, [labelKey]: undefinedLabel}];
    }
    if (hasUndefined && undefinedPosition === "top") {
        definitiveValues = [{[valueKey]: undefined, [labelKey]: undefinedLabel}, ...values];
    }

    return (
        <div className={theme!.select}>
            {label && <h5 className={theme!.title}>{i18next.t(label)}</h5>}
            <RadioGroup name={name} value={value} onChange={onChange} disabled={disabled}>
                {definitiveValues.map(option => {
                    const optVal = (option as any)[valueKey];
                    const optLabel = (option as any)[labelKey];

                    return (
                        <RadioButton
                            key={optVal || "undefined"}
                            label={i18next.t(optLabel)}
                            value={optVal}
                            theme={{field: theme!.option}}
                        />
                    );
                })}
            </RadioGroup>
            {error ? <div>{error}</div> : null}
        </div>
    );
}

export default themr("selectRadio", styles)(SelectRadio);
