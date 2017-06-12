import * as React from "react";
import {Switch as RTSwitch, SwitchProps as RTSwitchProps} from "react-toolbox/lib/switch";

export interface SwitchProps extends RTSwitchProps {
    onChange?: (value: boolean) => void;
    value?: boolean;
}

export function Switch(props: SwitchProps) {
    const rtProps = {...props, checked: props.value !== undefined ? props.value : props.checked};

    if (rtProps.hasOwnProperty("error")) {
        delete (rtProps as any).error;
    }

    return <RTSwitch {...rtProps} />;
}

export default Switch;
