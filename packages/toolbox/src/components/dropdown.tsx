import * as React from "react";
import {
    Dropdown as DropdownType,
    dropdownFactory,
    DropdownProps as RTDropdownProps,
    DropdownTheme
} from "react-toolbox/lib/dropdown/Dropdown";
import {DROPDOWN} from "react-toolbox/lib/identifiers";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtDropdownTheme from "react-toolbox/components/dropdown/theme.css";
const dropdownTheme: DropdownTheme = rtDropdownTheme;
export {dropdownTheme};

import {Input} from "./input";

const RTDropdown = dropdownFactory(Input as any);
type DropdownProps = Omit<RTDropdownProps, "theme"> & {theme?: CSSProp<DropdownTheme>};
export const Dropdown = React.forwardRef<DropdownType, DropdownProps>((props, ref) => {
    const theme = useTheme(DROPDOWN, dropdownTheme, props.theme);
    return <RTDropdown ref={ref} {...props} theme={fromBem(theme)} />;
});

export {DropdownProps, DropdownTheme};
