import classNames from "classnames";
import {FocusEventHandler, MouseEvent, ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";
import {useInputRef} from "../utils/use-input-ref";

import {FontIcon, Icon} from "./font-icon";
import {Ripple} from "./ripple";

import switchCss, {SwitchCss} from "./__style__/switch.css";

export {switchCss};
export type {SwitchCss};

export interface SwitchProps extends PointerEvents<HTMLLabelElement> {
    /** Classe CSS a ajouter au composant racine. */
    className?: string;
    /** Désactive le Switch. */
    disabled?: boolean;
    /** Si renseigné, le Switch sera affiché en rouge. */
    error?: boolean;
    /** Icône a afficher dans le Switch quand il est "off". */
    iconOff?: Icon;
    /** Icône a afficher dans le Switch quand il est "on". */
    iconOn?: Icon;
    /** Id pour l'input[type=checkbox] posé par le Switch. */
    id?: string;
    /** Libellé à poser à côté du Switch. */
    label?: ReactNode;
    /** Name pour l'input[type=checkbox] posé par le Switch. */
    name?: string;
    /** Au blur du Switch. */
    onBlur?: FocusEventHandler<HTMLInputElement>;
    /** Handler appelé au clic sur le Switch. */
    onChange?: (value: boolean, event?: MouseEvent<HTMLInputElement>) => void;
    /** Au focus du Switch. */
    onFocus?: FocusEventHandler<HTMLInputElement>;
    /** CSS. */
    theme?: CSSProp<SwitchCss>;
    /** Valeur (correspond à 'checked' sur l'input). */
    value: boolean;
}

/**
 * Un switch permet à un utilisateur de changer le statut d'un objet à actif/inactif.
 *
 * - Peut avoir un libellé.
 * - Peut afficher des icônes à l'intérieur, qui changent selon l'état du switch.
 */
export function Switch({
    className,
    disabled,
    error = false,
    id,
    label,
    name,
    onBlur,
    onChange,
    onFocus,
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
            className={classNames(theme.switch({checked: value, disabled, error, loading: !loaded}), className)}
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
            <span className={theme.track()} />
            <Ripple disabled={disabled}>
                <span className={theme.state()}>
                    {value !== undefined ? (
                        <>
                            <span className={theme.thumb({icon: !!iconOff})} />
                            {iconOn ? <FontIcon className={theme.icon({checked: true})} icon={iconOn} /> : null}
                            {iconOff ? <FontIcon className={theme.icon({unchecked: true})} icon={iconOff} /> : null}
                        </>
                    ) : null}
                </span>
            </Ripple>
            {label ? <span className={theme.label()}>{label}</span> : null}
        </label>
    );
}
