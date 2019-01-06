import i18next from "i18next";
import React from "react";
import {RadioButton, RadioGroup} from "react-toolbox/lib/radio";

import {themr} from "../theme";

import * as styles from "./__style__/boolean-radio.css";
export type BooleanRadioStyle = Partial<typeof styles>;
const Theme = themr("booleanRadio", styles);

export interface BooleanRadioProps {
    /** Disabled radio-select, default to: false */
    disabled?: boolean;
    /** Error message to display. */
    error?: string;
    /** Name for input field. */
    name: string;
    /** Call with each value change. */
    onChange: (value: boolean) => void;
    /** CSS. */
    theme?: BooleanRadioStyle;
    /** Value. */
    value?: boolean;
}

export function BooleanRadio({disabled, error, name, onChange, theme: pTheme, value}: BooleanRadioProps) {
    return (
        <Theme theme={pTheme}>
            {theme => (
                <>
                    <RadioGroup
                        name={name}
                        value={value === true ? "true" : value === false ? "false" : undefined}
                        onChange={(x: string) => onChange(x === "true")}
                        className={theme.radio}
                    >
                        <RadioButton label={i18next.t("focus.boolean.yes")} value={"true"} disabled={disabled} />
                        <RadioButton label={i18next.t("focus.boolean.no")} value={"false"} disabled={disabled} />
                    </RadioGroup>
                    {error ? <div>{error}</div> : null}
                </>
            )}
        </Theme>
    );
}
