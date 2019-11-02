import i18next from "i18next";
import * as React from "react";

import {SelectStyle, selectStyles} from "@focus4/forms";
import {useTheme} from "@focus4/styling";

/** Props du Select. */
export interface SelectProps {
    /** Désactive le select. */
    disabled?: boolean;
    /** Message d'erreur à afficher. */
    error?: React.ReactNode;
    /** Autorise la non-sélection en ajoutant une option vide. Par défaut : "true". */
    hasUndefined?: boolean;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nom du champ de libellé. */
    labelKey: string;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange?: (value: any) => void;
    /** CSS. */
    theme?: SelectStyle;
    /** Libellés des champs sans libellés. */
    unSelectedLabel?: string;
    /** Valeur. */
    value?: any;
    /** Nom du champ de valeur. */
    valueKey: string;
    /** Liste des valeurs. */
    values: {}[];
}

/** Surcouche de <select> pour s'interfacer avec un <Field>. */
export function Select({
    disabled,
    error,
    labelKey,
    name,
    onChange,
    theme: pTheme,
    value,
    valueKey,
    values,
    hasUndefined = true,
    i18nPrefix = "focus",
    unSelectedLabel = `${i18nPrefix}.select.unselected`
}: SelectProps) {
    const theme = useTheme("select", selectStyles, pTheme);

    // On ajoute l'élément vide si nécessaire.
    let finalValues = values;
    if (hasUndefined) {
        finalValues = [{[valueKey]: "", [labelKey]: i18next.t(unSelectedLabel)}, ...finalValues];
    }

    return (
        <div data-focus="select" className={theme.select({error: !!error})}>
            <select
                disabled={disabled}
                id={name}
                name={name}
                onChange={({currentTarget: {value: v}}) => onChange && onChange(v || undefined)}
                value={value === undefined ? "" : value}
            >
                {finalValues.map((val, idx) => {
                    const optVal = `${(val as any)[valueKey]}`;
                    const elementValue = (val as any)[labelKey];
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
}
