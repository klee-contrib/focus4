import * as React from "react";
import {RADIO} from "react-toolbox/lib/identifiers";
import radioFactory from "react-toolbox/lib/radio/Radio";
import {
    RadioButton as RadioButtonType,
    radioButtonFactory,
    RadioButtonProps
} from "react-toolbox/lib/radio/RadioButton";
import {radioGroupFactory, RadioGroupProps} from "react-toolbox/lib/radio/RadioGroup";

export interface RadioTheme {
    radio?: string;
    radioChecked?: string;
    ripple?: string;
}

import {useTheme} from "@focus4/styling";
import rtRadioTheme from "react-toolbox/components/radio/theme.css";
const radioTheme: RadioTheme = rtRadioTheme;
export {radioTheme};

import {rippleFactory} from "./ripple";

const RTRadioButton = radioButtonFactory(radioFactory(rippleFactory({rippleCentered: true, rippleSpread: 2.6})));
export const RadioButton = React.forwardRef<RadioButtonType, RadioButtonProps>((props, ref) => {
    const theme = useTheme(RADIO, radioTheme, props.theme);
    return <RTRadioButton ref={ref} {...props} theme={theme} />;
});

export const RadioGroup = radioGroupFactory(RadioButton);

export {RadioButtonProps, RadioGroupProps};
