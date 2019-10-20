import * as React from "react";
import {
    Dropdown as DropdownType,
    dropdownFactory,
    DropdownProps,
    DropdownTheme
} from "react-toolbox/lib/dropdown/Dropdown";
import {DROPDOWN} from "react-toolbox/lib/identifiers";

import {useTheme} from "@focus4/styling";
import rtDropdownTheme from "react-toolbox/components/dropdown/theme.css";
const dropdownTheme: DropdownTheme = rtDropdownTheme;
export {dropdownTheme};

import {Input} from "./input";

const RTDropdown = dropdownFactory(Input);
export const Dropdown = React.forwardRef<DropdownType, DropdownProps>((props, ref) => {
    const theme = useTheme(DROPDOWN, dropdownTheme, props.theme);
    return <RTDropdown ref={ref} {...props} theme={theme} />;
});

export {DropdownProps, DropdownTheme};
