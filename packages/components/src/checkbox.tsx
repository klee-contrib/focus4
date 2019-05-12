import * as React from "react";
import {Checkbox as RTCheckbox, CheckboxProps as RTCheckboxProps} from "react-toolbox/lib/checkbox";

/** Props du Checkbox. */
export interface CheckboxProps extends RTCheckboxProps {
    /** Est appelé quand on coche la case. */
    onChange?: (value: boolean) => void;
    /** Valeur. */
    value?: boolean;
}

/** Surcharge de la Checkbox de React-Toolbox pour utilisation avec un <Field> */
export function Checkbox(props: CheckboxProps) {
    // On remplace `value` par `checked`.
    const rtProps = {...props, checked: props.value !== undefined ? props.value : props.checked};

    // On supprime `error` qui n'est pas géré par la Checkbox.
    if (rtProps.hasOwnProperty("error")) {
        delete (rtProps as any).error;
    }

    return <RTCheckbox {...rtProps} />;
}
