import {forwardRef} from "react";
import {SWITCH} from "react-toolbox/lib/identifiers";
import {
    Switch as SwitchType,
    switchFactory,
    SwitchProps as RTSwitchProps,
    SwitchTheme
} from "react-toolbox/lib/switch/Switch";
import thumbFactory from "react-toolbox/lib/switch/Thumb";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtSwitchTheme from "react-toolbox/components/switch/theme.css";
const switchTheme: SwitchTheme = rtSwitchTheme;
export {switchTheme, SwitchTheme};

import {rippleFactory} from "./ripple";

/** Props du Switch. */
export interface SwitchProps extends Omit<RTSwitchProps, "theme"> {
    /** Est appelé quand on coche la case. */
    onChange?: (value: boolean) => void;
    theme?: CSSProp<SwitchTheme>;
    /** Valeur. */
    value?: boolean;
}

const RTThumb = thumbFactory(rippleFactory({rippleCentered: true, rippleSpread: 2.6}));
const Thumb = forwardRef<unknown, unknown>((props, ref) => {
    const theme = useTheme(SWITCH, switchTheme);
    return <RTThumb ref={ref} {...props} theme={fromBem(theme)} />;
});

const RTSwitch = switchFactory(Thumb);
export const Switch = forwardRef<SwitchType, SwitchProps>((props, ref) => {
    const theme = useTheme(SWITCH, switchTheme);

    // On remplace `value` par `checked`.
    const rtProps = {...props, checked: props.value !== undefined ? props.value : props.checked};

    // On supprime `error` qui n'est pas géré par le switch.
    if (rtProps.hasOwnProperty("error")) {
        delete (rtProps as any).error;
    }

    return <RTSwitch ref={ref} {...rtProps} theme={fromBem(theme)} />;
});
