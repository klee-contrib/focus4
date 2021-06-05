import classnames from "classnames";
import {CSSProperties, MouseEvent, MouseEventHandler, ReactNode, useCallback, useRef} from "react";
import {CheckboxTheme} from "react-toolbox/lib/checkbox/Checkbox";
import {CHECKBOX} from "react-toolbox/lib/identifiers";

import {Check} from "./check";

import {CSSProp, fromBem, useTheme} from "@focus4/styling";
import rtCheckboxTheme from "react-toolbox/components/checkbox/theme.css";
const checkboxTheme: CheckboxTheme = rtCheckboxTheme;
export {checkboxTheme, CheckboxTheme};

/** Props du Checkbox. */
export interface CheckboxProps {
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    /** If true, the checkbox shown as disabled and cannot be modified. */
    disabled?: boolean;
    /** Text label to attach next to the checkbox element. */
    label?: ReactNode;
    /** The id of the field to set in the input checkbox. */
    id?: string;
    /** The name of the field to set in the input checkbox. */
    name?: string;
    /** Est appelé quand on coche la case. */
    onChange?: (value: boolean, event: MouseEvent<HTMLInputElement>) => void;
    onMouseEnter?: MouseEventHandler<HTMLLabelElement>;
    onMouseLeave?: MouseEventHandler<HTMLLabelElement>;
    style?: CSSProperties;
    theme?: CSSProp<CheckboxTheme>;
    /** Valeur. */
    value?: boolean;
}

export function Checkbox({
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
    style,
    value = false
}: CheckboxProps) {
    const theme = useTheme(CHECKBOX, checkboxTheme, pTheme);
    const inputNode = useRef<HTMLInputElement | null>(null);

    const handleToggle = useCallback(
        (event: MouseEvent<HTMLInputElement>) => {
            if (event.pageX !== 0 && event.pageY !== 0) {
                inputNode.current?.blur();
            }
            if (!disabled && onChange) {
                onChange(!value, event);
            }
        },
        [disabled, onChange, value]
    );

    return (
        <label
            data-react-toolbox="checkbox"
            className={classnames(theme.field(), {[theme.disabled()]: disabled}, className)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <input
                checked={value}
                className={theme.input()}
                disabled={disabled}
                id={id}
                name={name}
                onChange={() => {}}
                onClick={handleToggle}
                readOnly
                ref={inputNode}
                type="checkbox"
            />
            <Check disabled={disabled} style={style} theme={fromBem(theme)} value={value} />
            {label ? (
                <span data-react-toolbox="label" className={theme.text()}>
                    {label}
                </span>
            ) : null}
            {children}
        </label>
    );
}
