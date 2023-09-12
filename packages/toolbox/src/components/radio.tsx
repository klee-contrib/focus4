import classNames from "classnames";
import {
    Children,
    cloneElement,
    MouseEvent,
    MouseEventHandler,
    ReactElement,
    ReactNode,
    TouchEventHandler,
    useCallback,
    useRef
} from "react";

import {CSSProp, ToBem, useTheme} from "@focus4/styling";

import {Ripple} from "./ripple";

import radioCss, {RadioCss} from "./__style__/radio.css";
export {RadioCss, radioCss};

interface RadioProps {
    checked: boolean;
    children?: ReactNode;
    onMouseDown?: MouseEventHandler<HTMLSpanElement>;
    onTouchStart?: TouchEventHandler<HTMLSpanElement>;
    theme: ToBem<RadioCss>;
}

function Radio({checked, children, onMouseDown, onTouchStart, theme}: RadioProps) {
    return (
        <Ripple centered>
            <div
                className={theme.radio({checked})}
                data-react-toolbox="radio"
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                {children}
            </div>
        </Ripple>
    );
}

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
    /** CSS. */
    theme?: CSSProp<RadioCss>;
    /** Valeur. */
    value: string;
}

/**
 * A utiliser dans un RadioGroup.
 */
export function RadioButton({
    checked = false,
    children,
    className = "",
    disabled = false,
    label,
    id,
    onChange,
    name,
    theme: pTheme
}: RadioButtonProps) {
    const theme = useTheme("RTRadio", radioCss, pTheme);
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
        <label className={classNames(theme.field({disabled}), className)} data-react-toolbox="radio">
            <input
                ref={inputNode}
                checked={checked}
                className={theme.input()}
                disabled={disabled}
                id={id}
                name={name}
                onClick={handleToggle}
                readOnly
                type="radio"
            />
            <Radio checked={checked} theme={theme} />
            {label ? (
                <span className={theme.text()} data-react-toolbox="label">
                    {label}
                </span>
            ) : null}
            {children}
        </label>
    );
}

export interface RadioGroupProps {
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    /** If true, the group will be displayed as disabled. */
    disabled?: boolean;
    /** Callback function that will be invoked when the value changes. */
    onChange?: (value: string) => void;
    /** Default value selected in the radio group. */
    value?: string;
}

/**
 * A utiliser avec RadioButton pour faire des radios. Les composants [`BooleanRadio`](components/forms.md#booleanradio) et [`SelectRadio`](components/forms.md#selectradio) en sont des implémentations pour les usages les plus courants.
 */
export function RadioGroup({className = "", children, disabled = false, onChange, value}: RadioGroupProps) {
    return (
        <div className={className} data-react-toolbox="radio-group">
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
