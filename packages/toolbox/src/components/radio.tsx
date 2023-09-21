import classNames from "classnames";
import {Children, cloneElement, MouseEvent, ReactElement, ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {Ripple} from "./ripple";

import radioCss, {RadioCss} from "./__style__/radio.css";
export {RadioCss, radioCss};

/** Props du Radio. */
export interface RadioButtonProps extends PointerEvents<HTMLLabelElement> {
    /** @internal */
    checked?: boolean;
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Désactive le RadioButton. */
    disabled?: boolean;
    /** Id pour l'input[type=radio] posé par le RadioButton. */
    id?: string;
    /** Libellé à poser à côté de la Checkbox. */
    label?: ReactNode;
    /** Name pour l'input[type=radio] posé par le RadioButton. */
    name?: string;
    /** @internal */
    onChange?: (value: boolean, event: MouseEvent<HTMLInputElement>) => void;
    /** CSS. */
    theme?: CSSProp<RadioCss>;
    /** Valeur du RadioGroup quand ce RadioButton est sélectionné. */
    value: string;
}

/**
 * A utiliser dans un RadioGroup.
 */
export function RadioButton({
    checked = false,
    className = "",
    disabled = false,
    label,
    id,
    onChange,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    name,
    theme: pTheme
}: RadioButtonProps) {
    const theme = useTheme("radio", radioCss, pTheme);
    const {ref, loaded, handleOnClick, handlePointerLeave, handlePointerUp} = useInputRef<
        HTMLInputElement,
        HTMLLabelElement
    >({
        disabled,
        onChange,
        onPointerLeave,
        onPointerUp,
        value: checked
    });

    return (
        <label
            className={classNames(theme.radio({checked, disabled, loading: !loaded}), className)}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
        >
            <input
                ref={ref}
                checked={checked}
                className={theme.input()}
                disabled={disabled}
                id={id}
                name={name}
                onClick={handleOnClick}
                readOnly
                type="radio"
            />
            <Ripple disabled={disabled}>
                <div className={theme.state()}>
                    <div className={theme.outline()}>
                        <div className={theme.dot()} />
                    </div>
                </div>
            </Ripple>
            {label ? <span className={theme.label()}>{label}</span> : null}
        </label>
    );
}

export interface RadioGroupProps {
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Les RadioButtons passés en enfant de ce composant seront ajoutés au groupe. */
    children?: ReactNode;
    /** Désactive les RadioButtons. */
    disabled?: boolean;
    /** Handler appelé au clic sur un RadioButton. */
    onChange?: (value: string) => void;
    /** Valeur séléctionnée parmis les RadioButtons. */
    value?: string;
}

/**
 * A utiliser avec RadioButton pour faire des radios. Les composants [`BooleanRadio`](components/forms.md#booleanradio) et [`SelectRadio`](components/forms.md#selectradio) en sont des implémentations pour les usages les plus courants.
 */
export function RadioGroup({className = "", children, disabled = false, onChange, value}: RadioGroupProps) {
    return (
        <div className={className}>
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
