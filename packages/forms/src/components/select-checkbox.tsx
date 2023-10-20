import i18next from "i18next";
import {useObserver} from "mobx-react";
import {SyntheticEvent} from "react";

import {
    DomainFieldType,
    DomainTypeMultiple,
    DomainTypeSingle,
    ReferenceList,
    SingleDomainFieldType
} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox, CheckboxCss} from "@focus4/toolbox";

import selectCheckboxCss, {SelectCheckboxCss} from "./__style__/select-checkbox.css";
export {selectCheckboxCss, SelectCheckboxCss};

function clickHandlerFactory<T extends DomainFieldType>(
    isDisabled: boolean,
    isSelected: boolean,
    value: DomainTypeMultiple<T> | undefined,
    optVal: DomainTypeSingle<SingleDomainFieldType<T>>,
    onChange: (value: DomainTypeMultiple<T>) => void
) {
    return (e: SyntheticEvent<any>) => {
        e.stopPropagation();
        e.preventDefault();

        if (!isDisabled) {
            if (isSelected) {
                // Is selected -> remove it
                onChange((value ? value.filter(val => val !== optVal) : []) as DomainTypeMultiple<T>);
            } else {
                // Is not selected -> add it
                onChange((value ? [...value.slice(), optVal] : [optVal]) as DomainTypeMultiple<T>);
            }
        }
    };
}

/** Props du SelectCheckbox */
export interface SelectCheckboxProps<T extends DomainFieldType> {
    /** Désactive le select. */
    disabled?: boolean;
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
    onChange: (value: DomainTypeMultiple<T>) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<CheckboxCss & SelectCheckboxCss>;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Valeur. */
    value?: DomainTypeMultiple<T>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Un composant de sélection multiple pour un champ de type liste de valeurs avec plusieurs choix possibles, dans une liste de référence.
 */
export function SelectCheckbox<T extends DomainFieldType>({
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
    const theme = useTheme<CheckboxCss & SelectCheckboxCss>("selectCheckbox", selectCheckboxCss, pTheme);

    return useObserver(() => (
        <div className={theme.select({error: !!error})}>
            {label ? <h5>{i18next.t(label)}</h5> : null}
            <ul>
                {values.map(option => {
                    const optVal = option[values.$valueKey];
                    const optLabel = option[values.$labelKey];

                    const isSelected = value ? !!value.find((val: any) => optVal === val) : false;
                    const isDisabled =
                        disabled || (maxSelectable !== undefined && maxSelectable === value?.length && !isSelected);
                    const clickHandler = clickHandlerFactory(isDisabled, isSelected, value, optVal, onChange);

                    return (
                        <li key={optVal} className={theme.option()} onClick={clickHandler}>
                            <Checkbox
                                disabled={isDisabled}
                                id={`${id!}-${optVal as string}`}
                                label={i18next.t(optLabel)}
                                name={`${name!}-${optVal as string}`}
                                theme={theme}
                                value={isSelected}
                            />
                        </li>
                    );
                })}
            </ul>
            {showSupportingText === "always" || (showSupportingText === "auto" && error) ? (
                <div className={theme.supportingText()}>{error}</div>
            ) : null}
        </div>
    ));
}
