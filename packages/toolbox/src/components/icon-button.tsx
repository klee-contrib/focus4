import classNames from "classnames";
import {createElement, CSSProperties, MouseEventHandler, ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useFixedBlurRef} from "../utils/use-fixed-blur-ref";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import iconButtonCss, {IconButtonCss} from "./__style__/icon-button.css";
export {iconButtonCss, IconButtonCss};

export interface IconButtonProps extends PointerEvents<HTMLButtonElement | HTMLLinkElement> {
    /** Indicates if the button should have accent color. */
    accent?: boolean;
    className?: string;
    /** If true, component will be disabled. */
    disabled?: boolean;
    href?: string;
    /** Value of the icon (See Font Icon Component). */
    icon: ReactNode;
    /** If true, the neutral colors are inverted. Useful to put a button over a dark background. */
    inverse?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Indicates if the button should have primary color. */
    primary?: boolean;
    style?: CSSProperties;
    target?: string;
    theme?: CSSProp<IconButtonCss>;
    /** Component root container type. */
    type?: string;
}

/**
 * Un bouton avec juste une icône. Les autres types de boutons sont réalisés avec le [`Button`](#button).
 */
export function IconButton({
    accent = false,
    className = "",
    disabled,
    href,
    icon,
    inverse,
    onClick,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    primary = false,
    style,
    target,
    theme: pTheme,
    type = "button"
}: IconButtonProps) {
    const theme = useTheme("RTIconButton", iconButtonCss, pTheme);
    const {ref, handlePointerLeave, handlePointerUp} = useFixedBlurRef({onPointerLeave, onPointerUp});

    const element = href ? "a" : "button";

    const props = {
        ref,
        className: classNames(theme.toggle({accent, inverse, neutral: !primary && !accent, primary}), className),
        disabled,
        href,
        onClick,
        style,
        target,
        type: !href ? type : null
    };

    return (
        <Ripple
            centered
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
        >
            {createElement(
                element,
                props,
                typeof icon === "string" ? <FontIcon className={theme.icon()} value={icon} /> : icon
            )}
        </Ripple>
    );
}
