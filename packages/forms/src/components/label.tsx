import i18next from "i18next";
import {CSSProperties, ReactNode} from "react";

import {CSSProp, getIcon, useTheme} from "@focus4/styling";
import {FontIcon, IconButton, Tooltip, TooltipCss} from "@focus4/toolbox";

import labelCss, {LabelCss} from "./__style__/label.css";
export {labelCss, LabelCss};

/** Props du Label. */
export interface LabelProps {
    /** Commentaire, affiché sur la tooltip */
    comment?: ReactNode;
    /** Pour l'icône de la tooltip. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Libellé. */
    label?: string;
    /** Id du champ associé */
    id?: string;
    /** Au click sur la tooltip. */
    onTooltipClick?: () => void;
    /** Affiche la tooltip. */
    showTooltip?: boolean;
    /** Style inline. */
    style?: CSSProperties;
    /** CSS de la tooltip. */
    tooltipTheme?: CSSProp<TooltipCss>;
    /** CSS. */
    theme?: CSSProp<LabelCss>;
}

/**
 * Le composant d'affichage du libellé par défaut pour [toutes les fonctions d'affichage de champs](model/display-fields.md). Peut inclure une tooltip à côté du libellé.
 */
export function Label({
    comment,
    i18nPrefix = "focus",
    label,
    id,
    onTooltipClick,
    showTooltip,
    style,
    tooltipTheme,
    theme: pTheme
}: LabelProps) {
    const theme = useTheme("label", labelCss, pTheme);
    return (
        <div className={theme.label()} style={style}>
            <label htmlFor={id}>{(label && i18next.t(label)) ?? ""}</label>
            {comment && showTooltip ? (
                <Tooltip
                    clickBehavior={onTooltipClick ? "hide" : "none"}
                    theme={tooltipTheme}
                    tooltip={typeof comment === "string" ? i18next.t(comment) : comment}
                >
                    {onTooltipClick ? (
                        <IconButton
                            className={theme.icon()}
                            icon={getIcon(`${i18nPrefix}.icons.label.tooltip`)}
                            onClick={onTooltipClick}
                        />
                    ) : (
                        <FontIcon className={theme.icon()} onPointerDown={onTooltipClick}>
                            {getIcon(`${i18nPrefix}.icons.label.tooltip`)}
                        </FontIcon>
                    )}
                </Tooltip>
            ) : null}
        </div>
    );
}
