import * as React from "react";
import checkFactory from "react-toolbox/lib/checkbox/Check";
import {
    Checkbox as CheckboxType,
    checkboxFactory,
    CheckboxProps,
    CheckboxTheme
} from "react-toolbox/lib/checkbox/Checkbox";
import {CHECKBOX} from "react-toolbox/lib/identifiers";

import {useTheme} from "@focus4/styling";
import rtCheckboxTheme from "react-toolbox/components/checkbox/theme.css";
const checkboxTheme: CheckboxTheme = rtCheckboxTheme;
export {checkboxTheme};

import {rippleFactory} from "./ripple";

const RTCheckbox = checkboxFactory(checkFactory(rippleFactory({rippleCentered: true, rippleSpread: 2.6})));
export const Checkbox = React.forwardRef<CheckboxType, CheckboxProps>((props, ref) => {
    const theme = useTheme(CHECKBOX, checkboxTheme, props.theme);
    return <RTCheckbox ref={ref} {...props} theme={theme} />;
});

export {CheckboxProps, CheckboxTheme};
