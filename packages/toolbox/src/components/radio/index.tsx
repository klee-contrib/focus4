import {Children, cloneElement, ReactElement} from "react";

import {RadioButton, RadioButtonProps, RadioTheme, radioTheme} from "./button";
export {RadioButton, RadioButtonProps, RadioTheme, radioTheme};

export interface RadioGroupProps {
    className?: string;
    /** Children to pass through the component. */
    children?: React.ReactNode;
    /** If true, the group will be displayed as disabled. */
    disabled?: boolean;
    /** Callback function that will be invoked when the value changes. */
    onChange?: (value: string) => void;
    /** Default value selected in the radio group. */
    value?: string;
}

export function RadioGroup({className = "", children, disabled = false, onChange, value}: RadioGroupProps) {
    return (
        <div data-react-toolbox="radio-group" className={className}>
            {Children.map(children, child => {
                if (!child) {
                    return child;
                }

                const radioButton = child as ReactElement<RadioButtonProps>;
                if (radioButton.type === RadioButton) {
                    return cloneElement(radioButton, {
                        checked: radioButton.props.value === value,
                        disabled: disabled || radioButton.props.disabled,
                        onChange: () => onChange?.(radioButton.props.value)
                    });
                }

                return cloneElement(radioButton);
            })}
        </div>
    );
}
