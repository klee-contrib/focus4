import {useObserver} from "mobx-react";
import {SyntheticEvent} from "react";
import {useTranslation} from "react-i18next";

import {DomainFieldTypeMultiple, DomainType, ReferenceList, SingleDomainFieldType} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox, CheckboxCss} from "@focus4/toolbox";

import selectCheckboxCss, {SelectCheckboxCss} from "./__style__/select-checkbox.css";
export {selectCheckboxCss};
export type {SelectCheckboxCss};

function clickHandlerFactory<T extends DomainFieldTypeMultiple>(
    isDisabled: boolean,
    isSelected: boolean,
    value: DomainType<T> | undefined,
    optVal: DomainType<SingleDomainFieldType<T>>,
    onChange: (value?: DomainType<T>) => void
) {
    return (e: SyntheticEvent<any>) => {
        e.stopPropagation();
        e.preventDefault();

        if (!isDisabled) {
            if (isSelected) {
                // Is selected -> remove it
                onChange((value ? value.filter(val => val !== optVal) : []) as DomainType<T>);
            } else {
                // Is not selected -> add it
                onChange((value ? [...value.slice(), optVal] : [optVal]) as DomainType<T>);
            }
        }
    };
}

/** Props du SelectCheckbox */
export interface SelectCheckboxProps<T extends DomainFieldTypeMultiple> {
    /** Désactive le select en entier (si `true`) ou bien une liste d'options. */
    disabled?: boolean | DomainType<T>;
    /** Message d'erreur à afficher. */
    error?: string;
    /** Libellé. */
    label?: string;
    /** Id de l'input. */
    id?: string;
    /** Nombre maximal d'éléments sélectionnables. */
    maxSelectable?: number;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value?: DomainType<T>) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<CheckboxCss & SelectCheckboxCss>;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Valeur. */
    value?: DomainType<T>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Un ensemble de [`Checkbox`](/docs/composants-focus4∕toolbox-checkbox--docs) qui constituent un composant de sélection multiple à partir d'une liste de référence.
 *
 * S'utilise avec [`selectFor`](/docs/modèle-métier-afficher-des-champs--docs#selectforfield-values-options) sur un champ liste.
 */
export function SelectCheckbox<const T extends DomainFieldTypeMultiple>({
    disabled = false,
    error,
    label,
    id,
    maxSelectable,
    name,
    onChange,
    showSupportingText = "always",
    theme: pTheme,
    value,
    values
}: SelectCheckboxProps<T>) {
    const {t} = useTranslation();
    const theme = useTheme<CheckboxCss & SelectCheckboxCss>("selectCheckbox", selectCheckboxCss, pTheme);

    return useObserver(() => (
        <div className={theme.select({error: !!error})}>
            {label ? <h5>{t(label)}</h5> : null}
            <ul>
                {values.map(option => {
                    const optVal = option[values.$valueKey];
                    const optLabel = option[values.$labelKey];

                    const isSelected = value ? !!value.find((val: any) => optVal === val) : false;
                    const isDisabled =
                        disabled === true ||
                        (Array.isArray(disabled) && (disabled as string[]).includes(optVal)) ||
                        (maxSelectable !== undefined && maxSelectable === value?.length && !isSelected);
                    const clickHandler = clickHandlerFactory(isDisabled, isSelected, value, optVal, onChange);

                    return (
                        <li key={optVal} className={theme.option()} onClick={clickHandler}>
                            <Checkbox
                                disabled={isDisabled}
                                id={`${id!}-${optVal as string}`}
                                label={t(optLabel)}
                                name={`${name!}-${optVal as string}`}
                                theme={theme}
                                value={isSelected}
                            />
                        </li>
                    );
                })}
            </ul>
            {showSupportingText === "always" || (showSupportingText === "auto" && error) ? (
                <div className={theme.supportingText()}>
                    <div>{error}</div>
                </div>
            ) : null}
        </div>
    ));
}
