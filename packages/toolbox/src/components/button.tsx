import classnames from "classnames";
import {
    createElement,
    CSSProperties,
    MouseEvent,
    MouseEventHandler,
    ReactNode,
    TouchEventHandler,
    useCallback,
    useRef
} from "react";
import {ButtonTheme} from "react-toolbox/lib/button";
import {BUTTON} from "react-toolbox/lib/identifiers";

import {CSSProp, useTheme} from "@focus4/styling";
import rtButtonTheme from "react-toolbox/components/button/theme.css";
const buttonTheme: ButtonTheme = rtButtonTheme;
export {buttonTheme, ButtonTheme};

import {FontIcon} from "./font-icon";
import {rippleFactory} from "./ripple";

export interface ButtonProps {
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
    /** Set it to false if you don't want the neutral styles to be included. */
    neutral?: boolean;
    onClick?: MouseEventHandler<HTMLLinkElement | HTMLButtonElement>;
    onMouseDown?: MouseEventHandler<HTMLLinkElement | HTMLButtonElement>;
    onMouseEnter?: MouseEventHandler<HTMLLinkElement | HTMLButtonElement>;
    onMouseLeave?: MouseEventHandler<HTMLLinkElement | HTMLButtonElement>;
    onMouseUp?: MouseEventHandler<HTMLLinkElement | HTMLButtonElement>;
    onTouchStart?: TouchEventHandler<HTMLLinkElement | HTMLButtonElement>;
    /** Indicates if the button should have primary color. */
    primary?: boolean;
    /** If true, the button will have a raised look. */
    raised?: boolean;
    style?: CSSProperties;
    /** Passed down to the root element */
    target?: string;
    /** Classnames object defining the component style. */
    theme?: CSSProp<ButtonTheme>;
    /** Component root container type. */
    type?: string;
}

export const Button = rippleFactory({theme: {rippleWrapper: buttonTheme.rippleWrapper}})(function RTButton({
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
    neutral = true,
    onClick,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseUp,
    onTouchStart,
    primary = false,
    raised = false,
    style,
    target,
    theme: pTheme,
    type = "button"
}: ButtonProps) {
    const theme = useTheme(BUTTON, buttonTheme, pTheme);
    const buttonNode = useRef<HTMLLinkElement | HTMLButtonElement | null>(null);

    const handleMouseUp = useCallback(
        (event: MouseEvent<HTMLLinkElement | HTMLButtonElement>) => {
            buttonNode.current?.blur();
            onMouseUp?.(event);
        },
        [onMouseUp]
    );

    const handleMouseLeave = useCallback(
        (event: MouseEvent<HTMLLinkElement | HTMLButtonElement>) => {
            buttonNode.current?.blur();
            onMouseLeave?.(event);
        },
        [onMouseLeave]
    );

    const element = href ? "a" : "button";
    const level = primary ? "primary" : accent ? "accent" : "neutral";
    const shape = raised ? "raised" : floating ? "floating" : "flat";

    const classes = classnames(
        theme.button(),
        [theme[shape]()],
        {
            [theme[level]()]: neutral,
            [theme.mini()]: mini,
            [theme.inverse()]: inverse
        },
        className
    );

    const props = {
        ref: buttonNode,
        className: classes,
        disabled,
        href,
        onClick,
        onMouseDown,
        onMouseEnter,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseLeave,
        onTouchStart,
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

    return onMouseEnter && disabled ? (
        <span onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp}>
            {buttonElement}
        </span>
    ) : (
        buttonElement
    );
});
