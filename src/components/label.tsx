import i18next from "i18next";
import * as React from "react";
import {themr} from "react-css-themr";
import {FontIcon} from "react-toolbox/lib/font_icon";
import Tooltip from "react-toolbox/lib/tooltip";
const TooltipIcon = Tooltip(FontIcon);

import {getIcon} from "./icon";

import * as styles from "./__style__/label.css";
export type LabelStyle = Partial<typeof styles>;

/** Props du Label. */
export interface LabelProps {
    /** Commentaire, affiché sur la tooltip */
    comment?: string;
    /** Pour l'icône de la tooltip. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Libellé. */
    label?: string;
    /** Nom du champ associé */
    name?: string;
    /** Affiche la tooltip. */
    showTooltip?: boolean;
    /** Style inline. */
    style?: React.CSSProperties;
    /** CSS. */
    theme?: LabelStyle;
}

export function Label({comment, i18nPrefix = "focus", label, name, showTooltip, style, theme}: LabelProps) {
    return (
        <div className={theme!.label} style={style}>
            <label htmlFor={name}>
                {label && i18next.t(label) || ""}
            </label>
            {comment && showTooltip ? <TooltipIcon className={theme!.icon} tooltip={i18next.t(comment)} value={getIcon(`${i18nPrefix}.icons.label.tooltip`)} /> : null}
        </div>
    );
}

export default themr("label", styles)(Label);
