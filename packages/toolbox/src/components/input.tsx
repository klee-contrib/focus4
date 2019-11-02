import * as React from "react";
import {INPUT} from "react-toolbox/lib/identifiers";
import {Input as InputType, inputFactory, InputProps, InputTheme} from "react-toolbox/lib/input/Input";

import {fromBem, useTheme} from "@focus4/styling";
import rtInputTheme from "react-toolbox/components/input/theme.css";
const inputTheme: InputTheme = rtInputTheme;
export {inputTheme};

import {FontIcon} from "./font-icon";

const RTInput = inputFactory(FontIcon);
export const Input = React.forwardRef<InputType, InputProps>((props, ref) => {
    const theme = useTheme(INPUT, inputTheme, props.theme);
    return <RTInput ref={ref} {...props} theme={fromBem(theme)} />;
});

export {InputProps, InputTheme};
