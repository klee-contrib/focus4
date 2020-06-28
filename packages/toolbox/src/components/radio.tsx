import * as React from "react";
import {RADIO} from "react-toolbox/lib/identifiers";
import {RadioTheme as RTRadioTheme} from "react-toolbox/lib/radio/base";
import radioFactory from "react-toolbox/lib/radio/Radio";
import {
    RadioButton as RadioButtonType,
    radioButtonFactory,
    RadioButtonProps as RTRadioButtonProps,
    RadioButtonTheme
} from "react-toolbox/lib/radio/RadioButton";
import {radioGroupFactory, RadioGroupProps} from "react-toolbox/lib/radio/RadioGroup";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtRadioTheme from "react-toolbox/components/radio/theme.css";
type RadioTheme = RadioButtonTheme & RTRadioTheme;
const radioTheme: RadioTheme = rtRadioTheme;
export {radioTheme, RadioTheme};

import {rippleFactory} from "./ripple";

const RTRadioButton = radioButtonFactory(radioFactory(rippleFactory({rippleCentered: true, rippleSpread: 2.6})));
type RadioButtonProps = Omit<RTRadioButtonProps, "theme"> & {theme?: CSSProp<RadioButtonTheme & RadioTheme>};
export const RadioButton = React.forwardRef<RadioButtonType, RadioButtonProps>((props, ref) => {
    const theme = useTheme(RADIO, radioTheme, props.theme);
    return <RTRadioButton ref={ref} {...props} theme={fromBem(theme)} />;
});

export const RadioGroup = radioGroupFactory(RadioButton as any);

export {RadioButtonProps, RadioGroupProps};
