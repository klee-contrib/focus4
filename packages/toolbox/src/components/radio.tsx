import classNames from "classnames";
import {createContext, FocusEventHandler, ReactNode, useContext, useMemo} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {Ripple} from "./ripple";

import radioCss, {RadioCss} from "./__style__/radio.css";
export {radioCss};
export type {RadioCss};

const RadioContext = createContext({
    disabled: false,
    onChange: undefined as ((value: string) => void) | undefined,
    value: undefined as string | undefined
});

/** Props du Radio. */
export interface RadioButtonProps extends PointerEvents<HTMLLabelElement> {
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
    /** Au blur du Radio. */
    onBlur?: FocusEventHandler<HTMLInputElement>;
    /** Au focus du Radio. */
    onFocus?: FocusEventHandler<HTMLInputElement>;
    /** CSS. */
    theme?: CSSProp<RadioCss>;
    /** Valeur du RadioGroup quand ce RadioButton est sélectionné. */
    value: string;
}

/**
 * Un bouton radio permet aux utilisateurs de choisir une option parmi un ensemble de valeurs.
 *
 * Un ensemble de `RadioButton` doit être contenu dans un `RadioGroup`.
 */
export function RadioButton({
    className = "",
    disabled = false,
    label,
    id,
    onBlur,
    onFocus,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    name,
    theme: pTheme,
    value
}: RadioButtonProps) {
    const theme = useTheme("radio", radioCss, pTheme);

    const {disabled: pDisabled, onChange, value: selectedValue} = useContext(RadioContext);
    const checked = selectedValue === value;
    disabled ||= pDisabled;

    const {ref, loaded, handleOnClick, handlePointerLeave, handlePointerUp} = useInputRef<
        HTMLInputElement,
        HTMLLabelElement
    >({
        disabled,
        onChange: () => onChange?.(value),
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
                onBlur={onBlur}
                onClick={handleOnClick}
                onFocus={onFocus}
                readOnly
                type="radio"
            />
            <Ripple disabled={disabled}>
                <span className={theme.state()}>
                    <span className={theme.outline()}>
                        <span className={theme.dot()} />
                    </span>
                </span>
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
    /** Désactive le RadioGroup. */
    disabled?: boolean;
    /** Handler appelé au clic sur un RadioButton. */
    onChange?: (value: string) => void;
    /** Valeur séléctionnée parmis les RadioButtons. */
    value?: string;
}

/**
 * Conteneur pour un ensemble de `RadioButton`, permettant de former un champ de saisie unique.
 *
 * Les composants `BooleanRadio` et `SelectRadio` sont des implémentations de plus haut niveau qui couvrent la plupart des cas d'utilisation
 * et sont à privilégier par rapport à l'usage direct d'un `RadioGroup` et de `RadioButton`.
 */
export function RadioGroup({className = "", children, disabled = false, onChange, value}: RadioGroupProps) {
    const ctx = useMemo(() => ({disabled, onChange, value}), [disabled, onChange, value]);
    return (
        <RadioContext.Provider value={ctx}>
            <div className={className}>{children}</div>
        </RadioContext.Provider>
    );
}
