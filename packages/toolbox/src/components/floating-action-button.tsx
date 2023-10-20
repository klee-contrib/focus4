import classNames from "classnames";
import {motion} from "framer-motion";
import {createElement, CSSProperties, FocusEventHandler, MouseEventHandler, ReactNode} from "react";

import {CSSProp, getDefaultTransition, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import floatingActionButtonCss, {FloatingActionButtonCss} from "./__style__/floating-action-button.css";
export {floatingActionButtonCss, FloatingActionButtonCss};

export interface FloatingActionButtonProps extends PointerEvents<HTMLButtonElement | HTMLLinkElement> {
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Couleur du bouton. */
    color?: "accent" | "light" | "primary";
    /** Désactive le bouton. */
    disabled?: boolean;
    /** Affiche le libellé du bouton dans le bouton. */
    extended?: boolean;
    /** Si renseigné, pose une balise <a> à la place du <button>. */
    href?: string;
    /** Icône a afficher dans le bouton. */
    icon?: ReactNode;
    /**  Libellé du bouton. */
    label?: string;
    /** Variation du bouton avec moins d'élévation (ombre moins marquée). */
    lowered?: boolean;
    /** Au blur du bouton. */
    onBlur?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Au clic sur le bouton. */
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Au focus du bouton. */
    onFocus?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Taille du bouton. */
    size?: "large" | "small";
    /** CSS inline pour l'élément racine. */
    style?: CSSProperties;
    /** "target" pour le <a>, si `href` est rensigné. */
    target?: string;
    /** CSS. */
    theme?: CSSProp<FloatingActionButtonCss>;
    /** Type de bouton HTML (ignoré si `href` est renseigné). */
    type?: string;
}

/**
 * Bouton action flottant.
 */
export function FloatingActionButton({
    className,
    color,
    disabled,
    extended = false,
    href,
    icon,
    label,
    lowered,
    onBlur,
    onClick,
    onFocus,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    size,
    style,
    target,
    theme: pTheme,
    type = "button"
}: FloatingActionButtonProps) {
    extended = (extended && !!label) || !icon;

    const theme = useTheme("floatingActionButton", floatingActionButtonCss, pTheme);
    const {ref, handlePointerLeave, handlePointerUp} = useInputRef({
        onPointerLeave,
        onPointerUp
    });

    const element = href ? "a" : "button";

    const props = {
        ref,
        "aria-label": !extended ? label : undefined,
        className: classNames(
            theme.button({
                disabled,
                extended,
                large: !extended && size === "large",
                lowered,
                accent: color === "accent",
                small: !extended && size === "small",
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
                icon ? <FontIcon className={theme.icon()}>{icon}</FontIcon> : null,
                <motion.div
                    animate={extended ? "extended" : "folded"}
                    className={theme.label()}
                    initial={extended ? "extended" : "folded"}
                    transition={getDefaultTransition()}
                    variants={{extended: {width: "auto"}, folded: {width: 0}}}
                >
                    {label ?? "\xa0"}
                </motion.div>
            )}
        </Ripple>
    );
}
