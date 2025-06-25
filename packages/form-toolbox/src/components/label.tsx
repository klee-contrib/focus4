import {ReactNode} from "react";
import {useTranslation} from "react-i18next";

import {CSSProp, useTheme} from "@focus4/styling";
import {FontIcon, IconButton, Tooltip, TooltipCss} from "@focus4/toolbox";

import labelCss, {LabelCss} from "./__style__/label.css";

export {labelCss};
export type {LabelCss};

/** Props du Label. */
export interface LabelProps {
    /** Commentaire, affiché sur la tooltip */
    comment?: ReactNode;
    /** Si le champ est en édition. */
    edit?: boolean;
    /** Erreur potentielle du champ. */
    error?: string;
    /** Pour l'icône de la tooltip. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Libellé. */
    label?: string;
    /** Id du champ associé */
    id?: string;
    /** Au click sur la tooltip. */
    onTooltipClick?: () => void;
    /** Si le champ est obligatoire. */
    required?: boolean;
    /** Affiche la tooltip. */
    showTooltip?: boolean;
    /** CSS de la tooltip. */
    tooltipTheme?: CSSProp<TooltipCss>;
    /** CSS. */
    theme?: CSSProp<LabelCss>;
}

/**
 * Un `Label` permet d'afficher le libellé d'un champ.
 *
 * - Résout les traductions i18n.
 * - Peut afficher le commentaire du champ en tooltip.
 *
 * Il s'agit du composant de libellé par défaut de tous les domaines (`LabelComponent`).
 */
export function Label({
    comment,
    edit,
    error,
    i18nPrefix = "focus",
    label,
    id,
    onTooltipClick,
    required,
    showTooltip,
    tooltipTheme,
    theme: pTheme
}: LabelProps) {
    const {t} = useTranslation();
    const theme = useTheme("label", labelCss, pTheme);

    return (
        <div className={theme.label({error: edit && !!error})}>
            <span>
                <label htmlFor={edit ? id : undefined}>{(label && t(label)) ?? ""}</label>
                {edit && required ? (
                    <span className={theme.required()}>{t(`${i18nPrefix}.label.required`)}</span>
                ) : null}
            </span>
            {comment && showTooltip ? (
                <Tooltip
                    clickBehavior={onTooltipClick ? "hide" : "none"}
                    theme={tooltipTheme}
                    tooltip={typeof comment === "string" ? t(comment) : comment}
                >
                    {onTooltipClick ? (
                        <IconButton
                            className={theme.icon()}
                            icon={{i18nKey: `${i18nPrefix}.icons.label.tooltip`}}
                            onClick={onTooltipClick}
                        />
                    ) : (
                        <FontIcon
                            className={theme.icon()}
                            icon={{i18nKey: `${i18nPrefix}.icons.label.tooltip`}}
                            onPointerDown={onTooltipClick}
                        />
                    )}
                </Tooltip>
            ) : null}
        </div>
    );
}
