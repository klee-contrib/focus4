import {MouseEvent} from "react";

import {CSSProp} from "@focus4/styling";
import {SupportingText, SupportingTextCss, Switch, SwitchCss, SwitchProps} from "@focus4/toolbox";

/**
 * Props du Switch.
 */
export interface FormSwitchProps extends Omit<SwitchProps, "error" | "onChange" | "theme" | "value"> {
    /** Erreur à afficher sous le champ. */
    error?: string;
    /** Handler appelé au clic sur le Switch. */
    onChange?: (value?: boolean, event?: MouseEvent<HTMLInputElement>) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<SwitchCss & SupportingTextCss>;
    /** Valeur (correspond à 'checked' sur l'input). */
    value?: boolean;
}

/**
 * Surcharge du [`Switch`](/docs/composants-focus4∕toolbox-switch--docs) de `@focus4/toolbox` pour utilisation dans un formulaire.
 *
 * Permet en plus l'affichage de l'erreur en dessous du champ.
 */
export function FormSwitch({
    disabled,
    error,
    id,
    showSupportingText = "always",
    theme,
    value,
    ...props
}: FormSwitchProps) {
    return (
        <>
            <Switch
                {...props}
                disabled={disabled}
                error={!!error}
                id={id}
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
