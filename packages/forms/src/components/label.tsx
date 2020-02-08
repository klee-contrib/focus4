import i18next from "i18next";
import * as React from "react";

import {getIcon, useTheme} from "@focus4/styling";
import {FontIcon, tooltipFactory} from "@focus4/toolbox";
const TooltipIcon = tooltipFactory()(FontIcon);

import labelStyles from "./__style__/label.css";
export {labelStyles};
export type LabelStyle = Partial<typeof labelStyles>;

/** Props du Label. */
export interface LabelProps {
    /** Commentaire, affiché sur la tooltip */
    comment?: React.ReactNode;
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
    style?: React.CSSProperties;
    /** CSS. */
    theme?: LabelStyle;
}

export function Label({
    comment,
    i18nPrefix = "focus",
    label,
    id,
    onTooltipClick,
    showTooltip,
    style,
    theme: pTheme
}: LabelProps) {
    const theme = useTheme("label", labelStyles, pTheme);
    return (
        <div className={theme.label} style={style}>
            <label htmlFor={id}>{(label && i18next.t(label)) || ""}</label>
            {comment && showTooltip ? (
                <TooltipIcon
                    className={`${theme.icon} ${!!onTooltipClick ? theme.clickable : ""}`}
                    tooltipHideOnClick={!onTooltipClick}
                    onClick={onTooltipClick}
                    tooltip={typeof comment === "string" ? i18next.t(comment) : comment}
                    value={getIcon(`${i18nPrefix}.icons.label.tooltip`)}
                />
            ) : null}
        </div>
    );
}
