import classNames from "classnames";
import {AriaAttributes, createElement, CSSProperties, FocusEventHandler, MouseEventHandler} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {FontIcon, Icon} from "./font-icon";
import {CircularProgressIndicator} from "./progress-indicator";
import {Ripple} from "./ripple";

import buttonCss, {ButtonCss} from "./__style__/button.css";
export {buttonCss};
export type {ButtonCss};

export interface ButtonProps extends PointerEvents<HTMLButtonElement | HTMLLinkElement>, AriaAttributes {
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Couleur du bouton. */
    color?: "accent" | "light" | "primary";
    /** Désactive le bouton. */
    disabled?: boolean;
    /** Si renseigné, pose une balise <a> à la place du <button>. */
    href?: string;
    /** Icône a afficher dans le bouton. */
    icon?: Icon;
    /** Position de l'icône dans le bouton. Par défaut : "left". */
    iconPosition?: "left" | "right";
    /**  Libellé du bouton. */
    label?: string;
    /** Affiche un indicateur de progression circulaire à la place de l'icône. */
    loading?: boolean;
    /** Au blur du bouton. */
    onBlur?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Au clic sur le bouton. */
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Au focus du bouton. */
    onFocus?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** CSS inline pour l'élément racine. */
    style?: CSSProperties;
    /** "target" pour le <a>, si `href` est rensigné. */
    target?: string;
    /** "tabindex" pour l'élément HTML. */
    tabIndex?: number;
    /** CSS. */
    theme?: CSSProp<ButtonCss>;
    /** Type de bouton HTML (ignoré si `href` est renseigné). */
    type?: string;
    /** Variante du bouton .*/
    variant?: "elevated-filled" | "elevated" | "filled" | "outlined";
}

/**
 * Le bouton standard permet de déclencher la plupart des actions dans une interface.
 *
 * - Peut contenir une icône (ou un spinner), à l'avant ou l'arrière.
 * - 5 types de boutons : simple, entouré, plein, surélevé et plein + surélevé.
 * - 3 couleurs au choix : primaire, accentuée, ou primaire claire.
 * - Peut être utilisé comme un bouton ou un lien.
 */
export function Button({
    className,
    color,
    disabled,
    href,
    icon,
    iconPosition = "left",
    label,
    loading,
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
}: ButtonProps) {
    const theme = useTheme("button", buttonCss, pTheme);
    const {ref, handlePointerLeave, handlePointerUp} = useInputRef({
        onPointerLeave,
        onPointerUp
    });

    const element = href ? "a" : "button";

    const props = {
        ...other,
        ref,
        className: classNames(
            theme.button({
                disabled,
                outlined: variant === "outlined",
                filled: variant?.includes("filled") && !!color,
                elevated: variant?.includes("elevated"),
                accent: color === "accent",
                primary: color === "primary",
                light: color === "light",
                label: !!label,
                left: (!!icon || !!loading) && iconPosition === "left",
                right: (!!icon || !!loading) && iconPosition === "right"
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
            {createElement(
                element,
                props,
                loading ? (
                    <CircularProgressIndicator className={theme.spinner()} indeterminate />
                ) : icon ? (
                    <FontIcon className={theme.icon()} icon={icon} />
                ) : null,
                <span className={theme.label()}>{label ?? "\xa0"}</span>
            )}
        </Ripple>
    );
}
