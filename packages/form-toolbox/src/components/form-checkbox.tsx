import {MouseEvent} from "react";

import {CSSProp} from "@focus4/styling";
import {Checkbox, CheckboxCss, CheckboxProps, SupportingText, SupportingTextCss} from "@focus4/toolbox";

/**
 * Props de la Checkbox.
 */
export interface FormCheckboxProps extends Omit<CheckboxProps, "error" | "onChange" | "theme" | "value"> {
    /** Erreur à afficher sous le champ. */
    error?: string;
    /** Handler appelé au clic sur la Checkbox. */
    onChange?: (value?: boolean, event?: MouseEvent<HTMLInputElement>) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<CheckboxCss & SupportingTextCss>;
    /** Valeur (correspond à 'checked' sur l'input). */
    value?: boolean;
}

/**
 * Surcharge du [`Checkbox`](/docs/composants-focus4∕toolbox-checkbox--docs) de `@focus4/toolbox` pour utilisation dans un formulaire.
 *
 * Permet en plus l'affichage de l'erreur en dessous du champ.
 */
export function FormCheckbox({
    disabled,
    error,
    id,
    showSupportingText = "always",
    theme,
    value,
    ...props
}: FormCheckboxProps) {
    return (
        <>
            <Checkbox
                {...props}
                disabled={disabled}
                error={!!error}
                label={undefined}
                theme={theme}
                value={value ?? false}
            />
            <SupportingText
                disabled={disabled}
                error={!!error}
                id={id}
                showSupportingText={showSupportingText}
                supportingText={error}
                theme={theme}
            />
        </>
    );
}
