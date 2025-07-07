import {useTranslation} from "react-i18next";

import {CSSProp, useTheme} from "@focus4/styling";
import {RadioButton, RadioCss, RadioGroup, SupportingText, SupportingTextCss} from "@focus4/toolbox";

import booleanRadioCss, {BooleanRadioCss} from "./__style__/boolean-radio.css";

export {booleanRadioCss};
export type {BooleanRadioCss};

export interface BooleanRadioProps {
    /** Autorise la sélection de `undefined` en cliquant sur le radio sélectionné pour le déselectionner. */
    allowUndefined?: boolean;
    /** Disabled radio-select, default to: false */
    disabled?: boolean;
    /** Error message to display. */
    error?: string;
    /** Libellé pour le "non". Par défaut: "focus.boolean.no" */
    labelNo?: string;
    /** Libellé pour le "oui". Par défaut: "focus.boolean.yes" */
    labelYes?: string;
    /** Name for input field. */
    name?: string;
    /** Call with each value change. */
    onChange: (value?: boolean) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<BooleanRadioCss & RadioCss & SupportingTextCss>;
    /** Value. */
    value?: boolean;
}

/**
 * Un [`RadioGroup`](/docs/composants-focus4∕toolbox-radiobutton--docs) avec 2 [`RadioButtons`](/docs/composants-focus4∕toolbox-radiobutton--docs) pour sélectionner un booléen (Oui/Non).
 */
export function BooleanRadio({
    allowUndefined = false,
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
    const {t} = useTranslation();
    const theme = useTheme<BooleanRadioCss & RadioCss & SupportingTextCss>("booleanRadio", booleanRadioCss, pTheme);
    return (
        <>
            <RadioGroup
                allowUndefined={allowUndefined}
                className={theme.boolean()}
                disabled={disabled}
                onChange={x => onChange(x === "true" ? true : x === "false" ? false : undefined)}
                value={value === true ? "true" : value === false ? "false" : undefined}
            >
                <RadioButton label={t(labelYes)} name={`${name}-yes`} theme={theme} value="true" />
                <RadioButton label={t(labelNo)} name={`${name}-no`} theme={theme} value="false" />
            </RadioGroup>
            <SupportingText
                disabled={disabled}
                error={!!error}
                showSupportingText={showSupportingText}
                supportingText={error}
                theme={theme}
            />
        </>
    );
}
