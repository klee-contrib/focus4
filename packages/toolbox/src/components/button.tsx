import * as React from "react";
import {ButtonTheme} from "react-toolbox/lib/button";
import {
    BrowseButton as BrowseButtonType,
    browseButtonFactory,
    BrowseButtonProps,
    BrowseButtonTheme
} from "react-toolbox/lib/button/BrowseButton";
import {Button as ButtonType, buttonFactory, ButtonProps} from "react-toolbox/lib/button/Button";
import {
    IconButton as IconButtonType,
    iconButtonFactory,
    IconButtonProps,
    IconButtonTheme
} from "react-toolbox/lib/button/IconButton";
import {BUTTON} from "react-toolbox/lib/identifiers";

import {fromBem, useTheme} from "@focus4/styling";
import rtButtonTheme from "react-toolbox/components/button/theme.css";
const buttonTheme: ButtonTheme = rtButtonTheme;
export {buttonTheme};

import {FontIcon} from "./font-icon";
import {rippleFactory} from "./ripple";

const RTButton = buttonFactory(rippleFactory({rippleCentered: false}), FontIcon);
export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<ButtonType>> = React.forwardRef(
    (props, ref) => {
        const theme = useTheme(BUTTON, buttonTheme, props.theme);
        return <RTButton ref={ref} {...props} theme={fromBem(theme)} />;
    }
);

const RTIconButton = iconButtonFactory(rippleFactory({rippleCentered: true}), FontIcon);
export const IconButton = React.forwardRef<IconButtonType, IconButtonProps>((props, ref) => {
    const theme = useTheme(BUTTON, buttonTheme, props.theme);
    return <RTIconButton ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTBrowseButton = browseButtonFactory(rippleFactory({rippleCentered: false}), FontIcon);
export const BrowseButton = React.forwardRef<BrowseButtonType, BrowseButtonProps>((props, ref) => {
    const theme = useTheme(BUTTON, buttonTheme, props.theme);
    return <RTBrowseButton ref={ref} {...props} theme={fromBem(theme)} />;
});

export {ButtonProps, ButtonTheme, IconButtonProps, IconButtonTheme, BrowseButtonProps, BrowseButtonTheme};
