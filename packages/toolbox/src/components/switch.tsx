import * as React from "react";
import {SWITCH} from "react-toolbox/lib/identifiers";
import {Switch as SwitchType, switchFactory, SwitchProps, SwitchTheme} from "react-toolbox/lib/switch/Switch";
import thumbFactory from "react-toolbox/lib/switch/Thumb";

import {useTheme} from "@focus4/styling";
import rtSwitchTheme from "react-toolbox/components/switch/theme.css";
const switchTheme: SwitchTheme = rtSwitchTheme;
export {switchTheme};

import {rippleFactory} from "./ripple";

const RTThumb = thumbFactory(rippleFactory({centered: true, spread: 2.6}));
const Thumb = React.forwardRef<unknown, unknown>((props, ref) => {
    const theme = useTheme(SWITCH, switchTheme);
    return <RTThumb ref={ref} {...props} theme={theme} />;
});

const RTSwitch = switchFactory(Thumb);
export const Switch = React.forwardRef<SwitchType, SwitchProps>((props, ref) => {
    const theme = useTheme(SWITCH, switchTheme);
    return <RTSwitch ref={ref} {...props} theme={theme} />;
});

export {SwitchProps, SwitchTheme};
