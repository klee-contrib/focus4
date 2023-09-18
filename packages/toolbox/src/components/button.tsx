import classNames from "classnames";
import {createElement, CSSProperties, MouseEventHandler, ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useFixedBlurRef} from "../utils/use-fixed-blur-ref";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import buttonCss, {ButtonCss} from "./__style__/button.css";
export {buttonCss, ButtonCss};

export interface ButtonProps extends PointerEvents<HTMLButtonElement | HTMLLinkElement> {
    /** Indicates if the button should have accent color. */
    accent?: boolean;
    /** Children to pass through the component. */
    children?: ReactNode;
    className?: string;
    /** If true, component will be disabled. */
    disabled?: boolean;
    /** If true, the button will have a floating look. */
    floating?: boolean;
    /** Creates a link for the button. */
    href?: string;
    /** Value of the icon (See Font Icon Component). */
    icon?: ReactNode;
    /** If true, the neutral colors are inverted. Useful to put a button over a dark background. */
    inverse?: boolean;
    /**  The text string to use for the name of the button. */
    label?: string;
    /** To be used with floating button. If true, the button will be smaller. */
    mini?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLLinkElement>;
    /** Indicates if the button should have primary color. */
    primary?: boolean;
    /** If true, the button will have a raised look. */
    raised?: boolean;
    style?: CSSProperties;
    /** Passed down to the root element */
    target?: string;
    /** Classnames object defining the component style. */
    theme?: CSSProp<ButtonCss>;
    /** Component root container type. */
    type?: string;
}

/**
 * Le bouton standard, qui peut être sous plusieurs formats (`raised`, `floating`) et de plusieurs couleurs (`primary`, `accent`), avoir une icône... Un bouton avec juste une icône est un [`IconButton`](#iconbutton)
 */
export function Button({
    accent = false,
    children,
    className = "",
    disabled,
    floating = false,
    href,
    icon,
    inverse,
    label,
    mini = false,
    onClick,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    primary = false,
    raised = false,
    style,
    target,
    theme: pTheme,
    type = "button"
}: ButtonProps) {
    const theme = useTheme("RTButton", buttonCss, pTheme);
    const {ref, handlePointerLeave, handlePointerUp} = useFixedBlurRef({onPointerLeave, onPointerUp});

    const element = href ? "a" : "button";

    const props = {
        ref,
        className: classNames(
            theme.button({
                accent,
                flat: !raised && !floating,
                floating,
                inverse,
                mini,
                neutral: !primary && !accent,
                primary,
                raised,
                solid: raised || floating,
                squared: !floating
            }),
            className
        ),
        disabled,
        href,
        onClick,
        style,
        target,
        type: !href ? type : null,
        "data-react-toolbox": "button"
    };

    const buttonElement = createElement(
        element,
        props,
        icon ? <FontIcon className={theme.icon()} value={icon} /> : null,
        label,
        children
    );

    return (
        <Ripple
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
        >
            {buttonElement}
        </Ripple>
    );
}
