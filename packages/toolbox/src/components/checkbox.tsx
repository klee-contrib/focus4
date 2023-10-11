import classNames from "classnames";
import {FocusEventHandler, MouseEvent, ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import checkboxCss, {CheckboxCss} from "./__style__/checkbox.css";
export {checkboxCss, CheckboxCss};

/** Props du Checkbox. */
export interface CheckboxProps extends PointerEvents<HTMLLabelElement> {
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Désactive la Checkbox. */
    disabled?: boolean;
    /** Si renseigné, la Checkbox sera affichée en rouge. */
    error?: string;
    /** Affiche une icône "indéterminée" à la place du "check" */
    indeterminate?: boolean;
    /** Id pour l'input[type=checkbox] posé par la Checkbox. */
    id?: string;
    /** Libellé à poser à côté de la Checkbox. */
    label?: ReactNode;
    /** Name pour l'input[type=checkbox] posé par la Checkbox. */
    name?: string;
    /** Au blur de la Checkbox. */
    onBlur?: FocusEventHandler<HTMLInputElement>;
    /** Handler appelé au clic sur la Checkbox. */
    onChange?: (value: boolean, event?: MouseEvent<HTMLInputElement>) => void;
    /** Au focus de la Checkbox. */
    onFocus?: FocusEventHandler<HTMLInputElement>;
    /** CSS. */
    theme?: CSSProp<CheckboxCss>;
    /** Valeur (correspond à 'checked' sur l'input). */
    value?: boolean;
}

/**
 * Une checkbox.
 */
export function Checkbox({
    className,
    disabled,
    error,
    id,
    indeterminate,
    label,
    name,
    onBlur,
    onChange,
    onFocus,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    theme: pTheme,
    value
}: CheckboxProps) {
    const theme = useTheme("checkbox", checkboxCss, pTheme);
    const {ref, loaded, handleOnClick, handlePointerLeave, handlePointerUp} = useInputRef<
        HTMLInputElement,
        HTMLLabelElement
    >({
        disabled,
        onChange,
        onPointerLeave,
        onPointerUp,
        value
    });

    return (
        <label
            className={classNames(
                theme.checkbox({checked: value, disabled, error: !!error, loading: !loaded}),
                className
            )}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
        >
            <input
                ref={ref}
                checked={value ?? false}
                className={theme.input()}
                disabled={disabled}
                id={id}
                name={name}
                onBlur={onBlur}
                onClick={handleOnClick}
                onFocus={onFocus}
                readOnly
                type="checkbox"
            />
            <Ripple disabled={disabled}>
                <div className={theme.state()}>
                    <div className={theme.outline()}>
                        <FontIcon className={theme.check()}>{indeterminate ? "remove" : "check"}</FontIcon>
                    </div>
                </div>
            </Ripple>
            {label ? <span className={theme.label()}>{label}</span> : null}
        </label>
    );
}
