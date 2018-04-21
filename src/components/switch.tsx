import * as React from "react";
import {Switch as RTSwitch, SwitchProps as RTSwitchProps} from "react-toolbox/lib/switch";

/** Props du Switch. */
export interface SwitchProps extends RTSwitchProps {
    /** Est appelé quand on coche la case. */
    onChange?: (value: boolean) => void;
    /** Valeur. */
    value?: boolean;
}

/** Surcharge du Switch de React-Toolbox pour utilisation avec un <Field> */
export function Switch(props: SwitchProps) {

    // On remplace `value` par `checked`.
    const rtProps = {...props, checked: props.value !== undefined ? props.value : props.checked};

    // On supprime `error` qui n'est pas géré par le switch.
    if (rtProps.hasOwnProperty("error")) {
        delete (rtProps as any).error;
    }

    return <RTSwitch {...rtProps} />;
}
