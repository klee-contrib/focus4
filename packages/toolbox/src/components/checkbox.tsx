import {forwardRef, ForwardRefExoticComponent, RefAttributes} from "react";
import checkFactory from "react-toolbox/lib/checkbox/Check";
import {
    Checkbox as CheckboxType,
    checkboxFactory,
    CheckboxProps as RTCheckboxProps,
    CheckboxTheme
} from "react-toolbox/lib/checkbox/Checkbox";
import {CHECKBOX} from "react-toolbox/lib/identifiers";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtCheckboxTheme from "react-toolbox/components/checkbox/theme.css";
const checkboxTheme: CheckboxTheme = rtCheckboxTheme;
export {checkboxTheme, CheckboxTheme};

import {rippleFactory} from "./ripple";

/** Props du Checkbox. */
export interface CheckboxProps extends Omit<RTCheckboxProps, "theme"> {
    /** Est appelé quand on coche la case. */
    onChange?: (value: boolean) => void;
    theme?: CSSProp<CheckboxTheme>;
    /** Valeur. */
    value?: boolean;
}

const RTCheckbox = checkboxFactory(checkFactory(rippleFactory({rippleCentered: true, rippleSpread: 2.6})));
export const Checkbox: ForwardRefExoticComponent<CheckboxProps & RefAttributes<CheckboxType>> = forwardRef(
    (props, ref) => {
        const theme = useTheme(CHECKBOX, checkboxTheme, props.theme);

        // On remplace `value` par `checked`.
        const rtProps = {...props, checked: props.value !== undefined ? props.value : props.checked};

        // On supprime `error` qui n'est pas géré par la Checkbox.
        if (rtProps.hasOwnProperty("error")) {
            delete (rtProps as any).error;
        }

        return <RTCheckbox ref={ref} {...rtProps} theme={fromBem(theme)} />;
    }
);
