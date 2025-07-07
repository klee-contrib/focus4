import {CSSProp, useTheme} from "@focus4/styling";

import supportingTextCss, {SupportingTextCss} from "./__style__/supporting-text.css";

export {supportingTextCss};
export type {SupportingTextCss};

/**
 * Props de SupportingText.
 */
export interface SupportingTextProps {
    /** Si le champ associé est désactivé. */
    disabled?: boolean;
    /** Si le champ associé est en erreur. */
    error?: boolean;
    /** `id` pour l'input HTML. */
    id?: string;
    /** Taille du champ. */
    length?: number;
    /** Taille maximum du champ. Sera affiché en dessous du champ à côté de `supportingText`. */
    maxLength?: number;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "auto". */
    showSupportingText?: "always" | "auto" | "never";
    /** Texte à afficher en dessous du champ. Sera affiché en rouge si `error`. */
    supportingText?: string;
    /** CSS. */
    theme?: CSSProp<SupportingTextCss>;
}

/**
 * Texte à afficher en dessous d'un champ (`TextField` par exemple) pour afficher un message (d'erreur) ou la taille du champ.
 */
export function SupportingText({
    disabled = false,
    error = false,
    id,
    length,
    maxLength,
    showSupportingText = "auto",
    supportingText,
    theme: pTheme
}: SupportingTextProps) {
    const theme = useTheme("supportingText", supportingTextCss, pTheme);

    return showSupportingText === "always" || (showSupportingText === "auto" && (!!supportingText || !!maxLength)) ? (
        <div className={theme.supportingText({disabled, error})}>
            <div id={id ? `${id}-st` : undefined}>{supportingText}</div>
            {maxLength ? (
                <div>
                    {length ?? 0}/{maxLength}
                </div>
            ) : null}
        </div>
    ) : null;
}
