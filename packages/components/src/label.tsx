import i18next from "i18next";
import * as React from "react";
import {FontIcon} from "react-toolbox/lib/font_icon";
import Tooltip from "react-toolbox/lib/tooltip";
const TooltipIcon = Tooltip(FontIcon);

import {themr} from "styling/src/theme";

import {getIcon} from "./icon";

import * as styles from "./__style__/label.css";
export type LabelStyle = Partial<typeof styles>;
const Theme = themr("label", styles);

/** Props du Label. */
export interface LabelProps {
    /** Commentaire, affiché sur la tooltip */
    comment?: React.ReactNode;
    /** Pour l'icône de la tooltip. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Libellé. */
    label?: string;
    /** Nom du champ associé */
    name?: string;
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
    name,
    onTooltipClick,
    showTooltip,
    style,
    theme: pTheme
}: LabelProps) {
    return (
        <Theme theme={pTheme}>
            {theme => (
                <div className={theme.label} style={style}>
                    <label htmlFor={name}>{(label && i18next.t(label)) || ""}</label>
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
            )}
        </Theme>
    );
}
