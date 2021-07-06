import i18next from "i18next";
import {useObserver} from "mobx-react";
import {ReactNode, SyntheticEvent} from "react";

import {ReferenceList} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox} from "@focus4/toolbox";

import selectCheckboxCss, {SelectCheckboxCss} from "./__style__/select-checkbox.css";
export {selectCheckboxCss, SelectCheckboxCss};

function clickHandlerFactory(
    isDisabled: boolean,
    isSelected: boolean,
    value: any[] | undefined,
    optVal: string | number,
    onChange: (value: any[] | undefined) => void
) {
    return (e: SyntheticEvent<any>) => {
        e.stopPropagation();
        e.preventDefault();

        if (!isDisabled) {
            if (isSelected) {
                // is selected -> remove it
                onChange(value ? value.filter(val => val !== optVal) : undefined);
            } else {
                // is not selected -> add it
                onChange(value ? [...value.slice(), optVal] : [optVal]);
            }
        }
    };
}

/** Props du SelectCheckbox */
export interface SelectCheckboxProps<T extends "string" | "number"> {
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: ReactNode;
    /** Libellé. */
    label?: string;
    /** Id de l'input. */
    id?: string;
    /** Nombre maximal d'éléments sélectionnables. */
    maxSelectable?: number;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: (T extends "string" ? string : number)[] | undefined) => void;
    /** CSS. */
    theme?: CSSProp<SelectCheckboxCss>;
    /** Type du champ (number ou string). */
    type: T;
    /** Valeur. */
    value: (T extends "string" ? string : number)[] | undefined;
    /** Liste des valeurs. */
    values: ReferenceList;
}

export function SelectCheckbox<T extends "string" | "number">({
    disabled = false,
    error,
    label,
    id,
    maxSelectable,
    name,
    onChange,
    theme: pTheme,
    value,
    values
}: SelectCheckboxProps<T>) {
    const theme = useTheme("selectCheckbox", selectCheckboxCss, pTheme);

    return useObserver(() => (
        <div className={theme.select()}>
            {label && <h5>{i18next.t(label)}</h5>}
            <ul>
                {values.map(option => {
                    const optVal = (option as any)[values.$valueKey];
                    const optLabel = (option as any)[values.$labelKey];

                    const isSelected = value ? !!(value as any).find((val: any) => optVal === val) : false;
                    const clickHandler = clickHandlerFactory(disabled, isSelected, value, optVal, onChange);

                    return (
                        <li key={optVal} onClick={clickHandler} className={theme.option()}>
                            <Checkbox
                                id={`${id}-${optVal}`}
                                name={`${name}-${optVal}`}
                                value={isSelected}
                                disabled={
                                    disabled ||
                                    (maxSelectable !== undefined &&
                                        maxSelectable === (value && value.length) &&
                                        !isSelected)
                                }
                                label={i18next.t(optLabel)}
                            />
                        </li>
                    );
                })}
            </ul>
            {error ? <div className={theme.error()}>{error}</div> : null}
        </div>
    ));
}
