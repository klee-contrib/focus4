import {useObserver} from "mobx-react";
import {useTranslation} from "react-i18next";
import {output} from "zod";

import {ZodTypeMultiple} from "@focus4/entities";
import {ReferenceList} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox, CheckboxCss, SupportingText, SupportingTextCss} from "@focus4/toolbox";

import selectCheckboxCss, {SelectCheckboxCss} from "./__style__/select-checkbox.css";

export {selectCheckboxCss};
export type {SelectCheckboxCss};

/** Props du SelectCheckbox */
export interface SelectCheckboxProps<S extends ZodTypeMultiple> {
    /** Désactive le select en entier (si `true`) ou bien une liste d'options. */
    disabled?: boolean | output<S>;
    /** Message d'erreur à afficher. */
    error?: string;
    /** Id de l'input. */
    id?: string;
    /** Nombre maximal d'éléments sélectionnables. */
    maxSelectable?: number;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value?: output<S>) => void;
    /** Schéma du champ (celui du domaine). */
    schema: S;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<CheckboxCss & SelectCheckboxCss & SupportingTextCss>;
    /** Valeur. */
    value?: output<S>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Un ensemble de [`Checkbox`](/docs/composants-focus4∕toolbox-checkbox--docs) qui constituent un composant de sélection multiple à partir d'une liste de référence.
 *
 * S'utilise avec [`selectFor`](/docs/modèle-métier-afficher-des-champs--docs#selectforfield-values-options) sur un champ liste.
 */
export function SelectCheckbox<const S extends ZodTypeMultiple>({
    disabled = false,
    error,
    id,
    maxSelectable,
    name,
    onChange,
    showSupportingText = "always",
    theme: pTheme,
    value,
    values
}: SelectCheckboxProps<S>) {
    const {t} = useTranslation();
    const theme = useTheme<CheckboxCss & SelectCheckboxCss & SupportingTextCss>(
        "selectCheckbox",
        selectCheckboxCss,
        pTheme
    );

    return useObserver(() => (
        <div className={theme.select()}>
            <ul>
                {values.map(option => {
                    const optVal = option[values.$valueKey];
                    const optLabel = option[values.$labelKey];

                    const isSelected = value ? !!value.some((val: any) => optVal === val) : false;
                    const isDisabled =
                        disabled === true ||
                        (Array.isArray(disabled) && (disabled as string[]).includes(optVal)) ||
                        (maxSelectable !== undefined && maxSelectable === value?.length && !isSelected);

                    return (
                        <li key={optVal} className={theme.option()}>
                            <Checkbox
                                disabled={isDisabled}
                                id={`${id!}-${optVal as string}`}
                                label={t(optLabel)}
                                name={`${name!}-${optVal as string}`}
                                theme={theme}
                                onChange={() => {
                                    if (!isDisabled) {
                                        if (isSelected) {
                                            onChange((value ? value.filter(val => val !== optVal) : []) as output<S>);
                                        } else {
                                            onChange((value ? [...value, optVal] : [optVal]) as output<S>);
                                        }
                                    }
                                }}
                                value={isSelected}
                            />
                        </li>
                    );
                })}
            </ul>
            <SupportingText
                disabled={disabled === true}
                error={!!error}
                id={id}
                showSupportingText={showSupportingText}
                supportingText={error}
                theme={theme}
            />
        </div>
    ));
}
