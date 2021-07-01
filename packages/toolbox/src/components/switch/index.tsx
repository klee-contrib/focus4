import classnames from "classnames";
import {MouseEvent, ReactNode, useCallback, useRef} from "react";

import {CSSProp, useTheme} from "@focus4/styling";
import switchCss, {SwitchCss} from "../__style__/switch.css";
export {switchCss, SwitchCss};

import {Thumb} from "./thumb";

/** Props du Switch. */
export interface SwitchProps {
    className?: string;
    /** If true, the switch shown as disabled and cannot be modified. */
    disabled?: boolean;
    /** Text label to attach next to the switch element. */
    label?: ReactNode;
    /** The id of the field to set in the input switch. */
    id?: string;
    /** The name of the field to set in the input switch. */
    name?: string;
    /** Est appelé quand on coche la case. */
    onChange?: (value: boolean, event: MouseEvent<HTMLInputElement>) => void;
    theme?: CSSProp<SwitchCss>;
    /** Valeur. */
    value?: boolean;
}

export function Switch({
    className = "",
    disabled = false,
    label,
    id,
    onChange,
    name,
    theme: pTheme,
    value = false
}: SwitchProps) {
    const theme = useTheme("RTSwitch", switchCss, pTheme);
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
            data-react-toolbox="switch"
            className={classnames(theme.field(), {[theme.disabled()]: disabled}, className)}
        >
            <input
                checked={value}
                className={theme.input()}
                id={id}
                onClick={handleToggle}
                name={name}
                readOnly
                ref={inputNode}
                type="checkbox"
            />
            <span className={theme[value ? "on" : "off"]()}>
                <Thumb disabled={disabled} theme={theme} />
            </span>
            {label ? <span className={theme.text()}>{label}</span> : null}
        </label>
    );
}
