import i18next from "i18next";
import {CSSProperties, ReactNode} from "react";

import {CSSProp, getIcon, useTheme} from "@focus4/styling";
import {FontIcon, tooltipFactory} from "@focus4/toolbox";
const TooltipIcon = tooltipFactory()(FontIcon);

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
    /** CSS. */
    theme?: CSSProp<LabelCss>;
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
    const theme = useTheme("label", labelCss, pTheme);
    return (
        <div className={theme.label()} style={style}>
            <label htmlFor={id}>{(label && i18next.t(label)) || ""}</label>
            {comment && showTooltip ? (
                <TooltipIcon
                    className={theme.icon({clickable: !!onTooltipClick})}
                    tooltipHideOnClick={!onTooltipClick}
                    onClick={onTooltipClick}
                    tooltip={typeof comment === "string" ? i18next.t(comment) : comment}
                    value={getIcon(`${i18nPrefix}.icons.label.tooltip`)}
                />
            ) : null}
        </div>
    );
}
