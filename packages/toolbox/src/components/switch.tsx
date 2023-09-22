import classNames from "classnames";
import {MouseEvent, ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import switchCss, {SwitchCss} from "./__style__/switch.css";
export {switchCss, SwitchCss};

export interface SwitchProps extends PointerEvents<HTMLLabelElement> {
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Désactive le Switch. */
    disabled?: boolean;
    /** Icône a afficher dans le Switch quand il est "off". */
    iconOff?: ReactNode;
    /** Icône a afficher dans le Switch quand il est "on". */
    iconOn?: ReactNode;
    /** Id pour l'input[type=checkbox] posé par le Switch. */
    id?: string;
    /** Libellé à poser à côté du Switch. */
    label?: ReactNode;
    /** Name pour l'input[type=checkbox] posé par le Switch. */
    name?: string;
    /** Handler appelé au clic sur le Switch. */
    onChange?: (value: boolean, event?: MouseEvent<HTMLInputElement>) => void;
    /** CSS. */
    theme?: CSSProp<SwitchCss>;
    /** Valeur (correspond à 'checked' sur l'input). */
    value?: boolean;
}

/**
 * Un switch, fonctionnellement identique à la [`Checkbox`](#checkbox).
 */
export function Switch({
    className,
    disabled,
    id,
    label,
    name,
    onChange,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    iconOn,
    iconOff,
    theme: pTheme,
    value
}: SwitchProps) {
    const theme = useTheme("switch", switchCss, pTheme);
    const {loaded, ref, handleOnClick, handlePointerLeave, handlePointerUp} = useInputRef({
        disabled,
        onChange,
        onPointerLeave,
        onPointerUp,
        value
    });

    return (
        <label
            className={classNames(theme.switch({checked: value, disabled, loading: !loaded}), className)}
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
                onClick={handleOnClick}
                readOnly
                type="checkbox"
            />
            <div className={theme.track()} />
            <Ripple disabled={disabled}>
                <div className={theme.state()}>
                    {value !== undefined ? (
                        <>
                            <div className={theme.thumb({icon: !!iconOff})} />
                            {iconOn ? <FontIcon className={theme.icon({checked: true})}>{iconOn}</FontIcon> : null}
                            {iconOff ? <FontIcon className={theme.icon({unchecked: true})}>{iconOff}</FontIcon> : null}
                        </>
                    ) : null}
                </div>
            </Ripple>
            {label ? <span className={theme.label()}>{label}</span> : null}
        </label>
    );
}
