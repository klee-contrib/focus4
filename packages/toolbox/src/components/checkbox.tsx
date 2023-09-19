import classNames from "classnames";
import {MouseEvent, ReactNode, useCallback} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents, useFixedBlurRef, useLoaded} from "../focus4.toolbox";

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
    error?: ReactNode;
    /** Affiche une icône "indéterminée" à la place du "check" */
    indeterminate?: boolean;
    /** Id pour l'input[type=checkbox] posé par la Checkbox. */
    id?: string;
    /** Libellé à poser à côté de la Checkbox. */
    label?: ReactNode;
    /** Name pour l'input[type=checkbox] posé par la Checkbox. */
    name?: string;
    /** Handler appelé au clic sur la Checkbox. */
    onChange?: (value: boolean, event?: MouseEvent<HTMLInputElement>) => void;
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
    onChange,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    theme: pTheme,
    value
}: CheckboxProps) {
    const theme = useTheme("RTCheckbox", checkboxCss, pTheme);
    const {ref, handlePointerLeave, handlePointerUp} = useFixedBlurRef<HTMLInputElement, HTMLLabelElement>({
        onPointerLeave,
        onPointerUp
    });
    const loaded = useLoaded(disabled, value);

    const handleToggle = useCallback(
        (event: MouseEvent<HTMLInputElement>) => {
            if (event.pageX !== 0 && event.pageY !== 0) {
                ref.current?.blur();
            }
            if (!disabled && onChange) {
                onChange(!value, event);
            }
        },
        [disabled, onChange, value]
    );

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
                onClick={handleToggle}
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
