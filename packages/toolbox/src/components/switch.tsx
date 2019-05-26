import * as React from "react";
import {SWITCH} from "react-toolbox/lib/identifiers";
import {
    Switch as SwitchType,
    switchFactory,
    SwitchProps as RTSwitchProps,
    SwitchTheme
} from "react-toolbox/lib/switch/Switch";
import thumbFactory from "react-toolbox/lib/switch/Thumb";

import {useTheme} from "@focus4/styling";
import rtSwitchTheme from "react-toolbox/components/switch/theme.css";
const switchTheme: SwitchTheme = rtSwitchTheme;
export {switchTheme, SwitchTheme};

import {rippleFactory} from "./ripple";

/** Props du Switch. */
export interface SwitchProps extends RTSwitchProps {
    /** Est appelé quand on coche la case. */
    onChange?: (value: boolean) => void;
    /** Valeur. */
    value?: boolean;
}

const RTThumb = thumbFactory(rippleFactory({rippleCentered: true, rippleSpread: 2.6}));
const Thumb = React.forwardRef<unknown, unknown>((props, ref) => {
    const theme = useTheme(SWITCH, switchTheme);
    return <RTThumb ref={ref} {...props} theme={theme} />;
});

const RTSwitch = switchFactory(Thumb);
export const Switch = React.forwardRef<SwitchType, SwitchProps>((props, ref) => {
    const theme = useTheme(SWITCH, switchTheme);

    // On remplace `value` par `checked`.
    const rtProps = {...props, checked: props.value !== undefined ? props.value : props.checked};

    // On supprime `error` qui n'est pas géré par le switch.
    if (rtProps.hasOwnProperty("error")) {
        delete (rtProps as any).error;
    }

    return <RTSwitch ref={ref} {...rtProps} theme={theme} />;
});
