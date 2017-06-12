import * as React from "react";
import {Checkbox as RTCheckbox, CheckboxProps as RTCheckboxProps} from "react-toolbox/lib/checkbox";

export interface CheckboxProps extends RTCheckboxProps {
    onChange?: (value: boolean) => void;
    value?: boolean;
}

export function Checkbox(props: CheckboxProps) {
    const rtProps = {...props, checked: props.value !== undefined ? props.value : props.checked};

    if (rtProps.hasOwnProperty("error")) {
        delete (rtProps as any).error;
    }

    return <RTCheckbox {...rtProps} />;
}

export default Checkbox;
