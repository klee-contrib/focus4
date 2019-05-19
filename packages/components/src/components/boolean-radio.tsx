import i18next from "i18next";
import React from "react";
import {RadioButton, RadioGroup} from "react-toolbox/lib/radio";

import {useTheme} from "@focus4/styling";

import styles from "./__style__/boolean-radio.css";
export type BooleanRadioStyle = Partial<typeof styles>;

export interface BooleanRadioProps {
    /** Disabled radio-select, default to: false */
    disabled?: boolean;
    /** Error message to display. */
    error?: string;
    /** Libellé pour le "non". Par défaut: "focus.boolean.no" */
    labelNo?: string;
    /** Libellé pour le "oui". Par défaut: "focus.boolean.yes" */
    labelYes?: string;
    /** Name for input field. */
    name: string;
    /** Call with each value change. */
    onChange: (value: boolean) => void;
    /** CSS. */
    theme?: BooleanRadioStyle;
    /** Value. */
    value?: boolean;
}

export function BooleanRadio({
    disabled,
    error,
    labelNo = "focus.boolean.no",
    labelYes = "focus.boolean.yes",
    name,
    onChange,
    theme: pTheme,
    value
}: BooleanRadioProps) {
    const theme = useTheme("booleanRadio", styles, pTheme);
    return (
        <>
            <RadioGroup
                name={name}
                value={value === true ? "true" : value === false ? "false" : undefined}
                onChange={(x: string) => onChange(x === "true")}
                className={theme.radio}
            >
                <RadioButton label={i18next.t(labelYes)} value="true" disabled={disabled} />
                <RadioButton label={i18next.t(labelNo)} value="false" disabled={disabled} />
            </RadioGroup>
            {error ? <div>{error}</div> : null}
        </>
    );
}
