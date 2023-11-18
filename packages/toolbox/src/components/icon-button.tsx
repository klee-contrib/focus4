import classNames from "classnames";
import {AriaAttributes, createElement, CSSProperties, FocusEventHandler, MouseEventHandler, ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import iconButtonCss, {IconButtonCss} from "./__style__/icon-button.css";
export {iconButtonCss, IconButtonCss};

export interface IconButtonProps extends PointerEvents<HTMLButtonElement | HTMLLinkElement>, AriaAttributes {
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Couleur du bouton. */
    color?: "accent" | "light" | "primary";
    /** Désactive le bouton. */
    disabled?: boolean;
    /** Si renseigné, pose une balise <a> à la place du <button>. */
    href?: string;
    /** Icône a afficher dans le bouton. */
    icon: ReactNode;
    /**  Libellé du bouton. */
    label?: string;
    /** Au blur du bouton. */
    onBlur?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Au clic sur le bouton. */
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Au focus du bouton. */
    onFocus?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** CSS inline pour l'élément racine. */
    style?: CSSProperties;
    /** "tabindex" pour l'élément HTML. */
    tabIndex?: number;
    /** "target" pour le <a>, si `href` est rensigné. */
    target?: string;
    /** CSS. */
    theme?: CSSProp<IconButtonCss>;
    /** Type de bouton HTML (ignoré si `href` est renseigné). */
    type?: string;
    /** Variante du bouton .*/
    variant?: "filled" | "outlined";
}

/**
 * Bouton simple avec une icône.
 */
export function IconButton({
    className,
    color,
    disabled,
    href,
    icon,
    label,
    onBlur,
    onClick,
    onFocus,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    style,
    tabIndex,
    target,
    theme: pTheme,
    type = "button",
    variant,
    ...other
}: IconButtonProps) {
    const theme = useTheme("iconButton", iconButtonCss, pTheme);
    const {ref, handlePointerLeave, handlePointerUp} = useInputRef({
        onPointerLeave,
        onPointerUp
    });

    const element = href ? "a" : "button";

    const props = {
        ...other,
        ref,
        "aria-label": label,
        className: classNames(
            theme.button({
                disabled,
                outlined: variant === "outlined",
                filled: variant?.includes("filled") && !!color,
                accent: color === "accent",
                primary: color === "primary",
                light: color === "light"
            }),
            className
        ),
        disabled: !href ? disabled : undefined,
        href,
        onBlur,
        onClick,
        onFocus,
        style,
        tabIndex,
        target: href ? target : undefined,
        type: !href ? type : undefined
    };

    return (
        <Ripple
            disabled={disabled}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
        >
            {createElement(element, props, <FontIcon className={theme.icon()}>{icon}</FontIcon>)}
        </Ripple>
    );
}
