import i18next from "i18next";

import {CSSProp, useTheme} from "@focus4/styling";
import {RadioButton, RadioCss, RadioGroup} from "@focus4/toolbox";

import booleanRadioCss, {BooleanRadioCss} from "./__style__/boolean-radio.css";
export {booleanRadioCss, BooleanRadioCss};

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
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<BooleanRadioCss & RadioCss>;
    /** Value. */
    value?: boolean;
}

/**
 * Un radio oui/non pour un booléen.
 */
export function BooleanRadio({
    disabled,
    error,
    labelNo = "focus.boolean.no",
    labelYes = "focus.boolean.yes",
    name,
    onChange,
    showSupportingText = "always",
    theme: pTheme,
    value
}: BooleanRadioProps) {
    const theme = useTheme<BooleanRadioCss & RadioCss>("booleanRadio", booleanRadioCss, pTheme);
    return (
        <>
            <RadioGroup
                className={theme.boolean()}
                onChange={(x: string) => onChange(x === "true")}
                value={value === true ? "true" : value === false ? "false" : undefined}
            >
                <RadioButton
                    disabled={disabled}
                    label={i18next.t(labelYes)}
                    name={`${name}-yes`}
                    theme={theme}
                    value="true"
                />
                <RadioButton
                    disabled={disabled}
                    label={i18next.t(labelNo)}
                    name={`${name}-no`}
                    theme={theme}
                    value="false"
                />
            </RadioGroup>
            {showSupportingText === "always" || (showSupportingText === "auto" && error) ? (
                <div className={theme.supportingText({error: !!error})}>{error}</div>
            ) : null}
        </>
    );
}
