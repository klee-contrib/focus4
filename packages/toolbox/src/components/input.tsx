import {forwardRef} from "react";
import {INPUT} from "react-toolbox/lib/identifiers";
import {Input as InputType, inputFactory, InputProps as RTInputProps, InputTheme} from "react-toolbox/lib/input/Input";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtInputTheme from "react-toolbox/components/input/theme.css";
const inputTheme: InputTheme = rtInputTheme;
export {inputTheme};

import {FontIcon} from "./font-icon";

const RTInput = inputFactory(FontIcon);
type InputProps = Omit<RTInputProps, "theme"> & {theme?: CSSProp<InputTheme>};
export const Input = forwardRef<InputType, InputProps>((props, ref) => {
    const theme = useTheme(INPUT, inputTheme, props.theme);
    return <RTInput ref={ref} {...props} theme={fromBem(theme)} />;
});

export {InputProps, InputTheme};
