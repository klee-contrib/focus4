import classNames from "classnames";
import {ChangeEvent, ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {useLoaded} from "../focus4.toolbox";
import {PointerEvents} from "../utils/pointer-events";

import {FontIcon} from "./font-icon";
import {Ripple} from "./ripple";

import switchCss, {SwitchCss} from "./__style__/switch.css";
export {switchCss, SwitchCss};

export interface SwitchProps extends PointerEvents<HTMLDivElement> {
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
    /** Name pour l'input[type=checkbox] posé par le Switch. */
    name?: string;
    /** Handler appelé au clic sur le Switch. */
    onChange?: (value: boolean, event?: ChangeEvent<HTMLInputElement>) => void;
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
    const theme = useTheme("RTSwitch", switchCss, pTheme);
    const loaded = useLoaded(disabled, value);

    return (
        <Ripple
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
            rippleTarget={theme.state()}
        >
            <div className={classNames(theme.switch({checked: value, disabled, loading: !loaded}), className)}>
                <input
                    checked={value ?? false}
                    className={theme.checkbox()}
                    disabled={disabled}
                    id={id}
                    name={name}
                    onChange={e => onChange?.(!value, e)}
                    type="checkbox"
                />
                <div className={theme.track()}>
                    <div className={theme.state()}>
                        {value !== undefined ? (
                            <div className={theme.outline()}>
                                <div className={theme.thumb({icon: !!iconOff})} />
                                {iconOn ? <FontIcon className={theme.icon({checked: true})}>{iconOn}</FontIcon> : null}
                                {iconOff ? (
                                    <FontIcon className={theme.icon({unchecked: true})}>{iconOff}</FontIcon>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Ripple>
    );
}
