import classnames from "classnames";
import {CSSProperties, MouseEvent, MouseEventHandler, ReactNode, useCallback, useRef} from "react";
import {RADIO} from "react-toolbox/lib/identifiers";
import {RadioButtonTheme} from "react-toolbox/lib/radio/RadioButton";

import {Radio, RadioTheme} from "./radio";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtRadioTheme from "react-toolbox/components/radio/theme.css";
const radioTheme: RadioButtonTheme & RadioTheme = rtRadioTheme;
export {radioTheme, RadioTheme};

/** Props du Radio. */
export interface RadioButtonProps {
    /** @internal */
    checked?: boolean;
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    /** If true, the radio shown as disabled and cannot be modified. */
    disabled?: boolean;
    /** Text label to attach next to the radio element. */
    label?: ReactNode;
    /** The id of the field to set in the input radio. */
    id?: string;
    /** The name of the field to set in the input radio. */
    name?: string;
    /** @internal */
    onChange?: (value: boolean, event: MouseEvent<HTMLInputElement>) => void;
    onMouseEnter?: MouseEventHandler<HTMLLabelElement>;
    onMouseLeave?: MouseEventHandler<HTMLLabelElement>;
    style?: CSSProperties;
    theme?: CSSProp<RadioButtonTheme & RadioTheme>;
    /** Valeur. */
    value: string;
}

export function RadioButton({
    checked = false,
    children,
    className = "",
    disabled = false,
    label,
    id,
    onChange,
    onMouseEnter,
    onMouseLeave,
    name,
    theme: pTheme,
    style
}: RadioButtonProps) {
    const theme = useTheme(RADIO, radioTheme, pTheme);
    const inputNode = useRef<HTMLInputElement | null>(null);

    const handleToggle = useCallback(
        (event: MouseEvent<HTMLInputElement>) => {
            if (event.pageX !== 0 && event.pageY !== 0) {
                inputNode.current?.blur();
            }
            if (!disabled && onChange) {
                onChange(!checked, event);
            }
        },
        [disabled, onChange, checked]
    );

    return (
        <label
            data-react-toolbox="radio"
            className={classnames(theme[disabled ? "disabled" : "field"](), className)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <input
                checked={checked}
                className={theme.input()}
                disabled={disabled}
                id={id}
                name={name}
                onClick={handleToggle}
                readOnly
                ref={inputNode}
                type="radio"
            />
            <Radio checked={checked} disabled={disabled} style={style} theme={fromBem(theme)} />
            {label ? (
                <span data-react-toolbox="label" className={theme.text()}>
                    {label}
                </span>
            ) : null}
            {children}
        </label>
    );
}
