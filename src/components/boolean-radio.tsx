import i18next from "i18next";
import React from "react";
import {themr} from "react-css-themr";
import {RadioButton, RadioGroup} from "react-toolbox/lib/radio";

import * as styles from "./__style__/boolean-radio.css";
export type BooleanRadioStyle = Partial<typeof styles>;

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

export function BooleanRadio({disabled, error, name, onChange, theme, value}: BooleanRadioProps) {
    return (
        <div>
            <RadioGroup name={name} value={value} onChange={onChange} className={theme!.radio}>
                <RadioButton label={i18next.t("focus.yes")} value={true} disabled={disabled} />
                <RadioButton label={i18next.t("focus.no")} value={false} disabled={disabled} />
            </RadioGroup>
            {error ? <div>{error}</div> : null}
        </div>
    );
}

export default themr("booleanRadio", styles)(BooleanRadio);
