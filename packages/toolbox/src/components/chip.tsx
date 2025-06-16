import classNames from "classnames";
import {createElement, FocusEventHandler, MouseEvent, MouseEventHandler, useCallback} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {FontIcon, Icon} from "./font-icon";
import {IconButton} from "./icon-button";
import {Ripple} from "./ripple";

import chipCss, {ChipCss} from "./__style__/chip.css";
export {chipCss};
export type {ChipCss};

export interface ChipProps extends PointerEvents<HTMLButtonElement | HTMLLinkElement | HTMLSpanElement> {
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Couleur du Chip. */
    color?: "accent" | "light" | "primary";
    /** Désactive le Chip. */
    disabled?: boolean;
    /** Si renseigné, le Chip est affiché avec une élévation. */
    elevated?: boolean;
    /** Si renseigné, pose une balise `<a>` à la place du `<button>` ou `<span>`. */
    href?: string;
    /** Icône a afficher dans le Chip (à gauche). */
    icon?: Icon;
    /**  Libellé du chip. */
    label: string;
    /** Au blur du Chip (si actionnable). */
    onBlur?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Au click sur le Chip. Pose un <button> au lieu d'un <span> si rensgeiné. */
    onClick?: MouseEventHandler<HTMLButtonElement>;
    /** Si renseigné, le Chip a une action de suppression via un bouton icône (à droite). */
    onDeleteClick?: MouseEventHandler<HTMLSpanElement>;
    /** Au focus du Chip (si actionnable). */
    onFocus?: FocusEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** "target" pour le `<a>`, si `href` est rensigné. */
    target?: string;
    /** CSS. */
    theme?: CSSProp<ChipCss>;
}

/**
 * Un chip permet aux utilisateurs de renseigner de l'information, faire des sélections, filtrer du contenu ou déclencher des actions.
 *
 * - Peut contenir une icône à l'avant, et une action de suppression à l'arrière.
 * - 3 couleurs au choix : primaire, accentuée, ou primaire claire.
 * - Peut être utilisé comme un bouton ou un lien.
 */
export function Chip({
    className,
    color,
    disabled,
    elevated,
    href,
    icon,
    label,
    onBlur,
    onClick,
    onDeleteClick,
    onFocus,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    target,
    theme: pTheme
}: ChipProps) {
    const theme = useTheme("chip", chipCss, pTheme);
    const {ref, handlePointerLeave, handlePointerUp} = useInputRef({
        onPointerLeave,
        onPointerUp
    });

    const element = href ? "a" : onClick ? "button" : "span";

    const props = {
        ref,
        className: classNames(
            theme.chip({
                clickable: !!href || !!onClick,
                disabled,
                elevated,
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
        target: href ? target : undefined,
        type: onClick ? "button" : undefined
    };

    const handleDeleteClick = useCallback(
        function handleDeleteClick(e: MouseEvent<HTMLButtonElement>) {
            e.stopPropagation();
            onDeleteClick?.(e);
        },
        [onDeleteClick]
    );

    return (
        <Ripple
            disabled={!!disabled || (!onClick && !href)}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
        >
            {createElement(
                element,
                props,
                icon ? <FontIcon className={theme.icon()} icon={icon} /> : null,
                onDeleteClick ? (
                    <IconButton
                        className={theme.delete()}
                        disabled={disabled}
                        icon="clear"
                        onClick={handleDeleteClick}
                        onPointerDown={e => e.stopPropagation()}
                    />
                ) : null,
                <span className={theme.label()}>{label}</span>
            )}
        </Ripple>
    );
}
