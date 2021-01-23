import {forwardRef, ForwardRefExoticComponent, RefAttributes} from "react";
import {ButtonTheme} from "react-toolbox/lib/button";
import {ButtonBaseProps} from "react-toolbox/lib/button/base";
import {
    BrowseButton as BrowseButtonType,
    browseButtonFactory,
    BrowseButtonProps as RTBrowseButtonProps,
    BrowseButtonTheme
} from "react-toolbox/lib/button/BrowseButton";
import {Button as ButtonType, buttonFactory} from "react-toolbox/lib/button/Button";
import {
    IconButton as IconButtonType,
    iconButtonFactory,
    IconButtonProps as RTIconButtonProps,
    IconButtonTheme
} from "react-toolbox/lib/button/IconButton";
import {BUTTON} from "react-toolbox/lib/identifiers";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtButtonTheme from "react-toolbox/components/button/theme.css";
const buttonTheme: ButtonTheme = rtButtonTheme;
export {buttonTheme};

import {FontIcon} from "./font-icon";
import {rippleFactory, RippleProps, RippleTheme} from "./ripple";

interface ButtonProps extends ButtonBaseProps, RippleProps {
    /** If true, the button will have a flat look. */
    flat?: boolean;
    /** If true, the button will have a floating look. */
    floating?: boolean;
    /** Creates a link for the button. */
    href?: string;
    /**  The text string to use for the name of the button. */
    label?: string;
    /** To be used with floating button. If true, the button will be smaller. */
    mini?: boolean;
    /** If true, the button will have a raised look. */
    raised?: boolean;
    /** Passed down to the root element */
    target?: string;
    /** Classnames object defining the component style. */
    theme?: CSSProp<ButtonTheme & RippleTheme>;
}

const RTButton = buttonFactory(rippleFactory({rippleCentered: false}), FontIcon);
export const Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<ButtonType>> = forwardRef((props, ref) => {
    const theme = useTheme(BUTTON, buttonTheme, props.theme);
    return <RTButton ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTIconButton = iconButtonFactory(rippleFactory({rippleCentered: true}), FontIcon);
type IconButtonProps = Omit<RTIconButtonProps, "theme"> & {theme?: CSSProp<IconButtonTheme>};
export const IconButton = forwardRef<IconButtonType, IconButtonProps>((props, ref) => {
    const theme = useTheme(BUTTON, buttonTheme, props.theme);
    return <RTIconButton ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTBrowseButton = browseButtonFactory(rippleFactory({rippleCentered: false}), FontIcon);
type BrowseButtonProps = Omit<RTBrowseButtonProps, "theme"> & {theme?: CSSProp<BrowseButtonTheme>};
export const BrowseButton = forwardRef<BrowseButtonType, BrowseButtonProps>((props, ref) => {
    const theme = useTheme(BUTTON, buttonTheme, props.theme);
    return <RTBrowseButton ref={ref} {...props} theme={fromBem(theme)} />;
});

export {ButtonProps, ButtonTheme, IconButtonProps, IconButtonTheme, BrowseButtonProps, BrowseButtonTheme};
