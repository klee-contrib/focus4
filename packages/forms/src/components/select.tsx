import i18next from "i18next";
import {useObserver} from "mobx-react";
import {ReactNode} from "react";

import {ReferenceList} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import selectCss, {SelectCss} from "./__style__/select.css";
export {selectCss, SelectCss};

/** Props du Select. */
export interface SelectProps<T extends "string" | "number"> {
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: ReactNode;
    /** Autorise la non-sélection en ajoutant une option vide. Par défaut : "true". */
    hasUndefined?: boolean;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Id de l'input. */
    id?: string;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: (T extends "string" ? string : number) | undefined) => void;
    /** CSS. */
    theme?: CSSProp<SelectCss>;
    /** Type du champ (number ou string). */
    type: T;
    /** Libellés des champs sans libellés. */
    unSelectedLabel?: string;
    /** Valeur. */
    value: (T extends "string" ? string : number) | undefined;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/** Surcouche de <select> pour s'interfacer avec un <Field>. */
export function Select<T extends "string" | "number">({
    disabled,
    error,
    id,
    name,
    onChange,
    theme: pTheme,
    type,
    value,
    values,
    hasUndefined = true,
    i18nPrefix = "focus",
    unSelectedLabel = `${i18nPrefix}.select.unselected`
}: SelectProps<T>) {
    const theme = useTheme("select", selectCss, pTheme);
    const {$labelKey, $valueKey} = values;

    return useObserver(() => {
        // On ajoute l'élément vide si nécessaire.
        let finalValues: any[] = values.slice();
        if (hasUndefined) {
            finalValues = [{[$valueKey]: "", [$labelKey]: i18next.t(unSelectedLabel)}, ...finalValues];
        }

        return (
            <div className={theme.select({error: !!error})} data-focus="select">
                <select
                    disabled={disabled}
                    id={id}
                    name={name}
                    onChange={({currentTarget: {value: val}}) => {
                        const v = type === "number" ? parseFloat(val) : val;
                        onChange(v || v === 0 ? (v as any) : undefined);
                    }}
                    value={value === undefined ? "" : value}
                >
                    {finalValues.map((val, idx) => {
                        const optVal = `${val[$valueKey] as string | number}`;
                        const elementValue = val[$labelKey];
                        const optLabel =
                            elementValue === undefined ? i18next.t(`${i18nPrefix}.select.noLabel`) : elementValue;
                        return (
                            <option key={idx} value={optVal}>
                                {i18next.t(optLabel)}
                            </option>
                        );
                    })}
                </select>
                {error ? <div className={theme.error()}>{error}</div> : null}
            </div>
        );
    });
}
