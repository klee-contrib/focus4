import i18next from "i18next";
import * as React from "react";

import {selectRadioCss, SelectRadioCss} from "@focus4/forms";
import {CSSProp, useTheme} from "@focus4/styling";
import {RadioButton, RadioGroup} from "@focus4/toolbox";

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
    theme?: CSSProp<SelectRadioCss>;
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
    theme: pTheme,
    value,
    valueKey,
    values,
    hasUndefined = false,
    undefinedLabel = "focus.select.none",
    undefinedPosition = "bottom"
}: SelectRadioProps) {
    const theme = useTheme("selectRadio", selectRadioCss, pTheme);

    let definitiveValues = values;
    if (hasUndefined && undefinedPosition === "bottom") {
        definitiveValues = [...values, {[valueKey]: undefined, [labelKey]: undefinedLabel}];
    }
    if (hasUndefined && undefinedPosition === "top") {
        definitiveValues = [{[valueKey]: undefined, [labelKey]: undefinedLabel}, ...values];
    }

    return (
        <div className={theme.select()}>
            {label && <h5 className={theme.title()}>{i18next.t(label)}</h5>}
            <RadioGroup name={name} value={value} onChange={onChange} disabled={disabled}>
                {definitiveValues.map(option => {
                    const optVal = (option as any)[valueKey];
                    const optLabel = (option as any)[labelKey];

                    return (
                        <RadioButton
                            key={optVal || "undefined"}
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
}
