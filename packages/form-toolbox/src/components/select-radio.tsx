import i18next from "i18next";
import {useObserver} from "mobx-react";
import {useCallback} from "react";

import {stringToDomainType} from "@focus4/forms";
import {DomainFieldTypeSingle, DomainType, ReferenceList} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {RadioButton, RadioCss, RadioGroup} from "@focus4/toolbox";

import selectRadioCss, {SelectRadioCss} from "./__style__/select-radio.css";
export {selectRadioCss};
export type {SelectRadioCss};

/** Props du SelectRadio. */
export interface SelectRadioProps<T extends DomainFieldTypeSingle> {
    /** Désactive le select. */
    disabled?: boolean | DomainType<T>[];
    /** Message d'erreur à afficher. */
    error?: string;
    /** Libellé. */
    label?: string;
    /** Permet de sélectionner `undefined` avec une option supplémentaire "vide" (`"first-option"` ou `"last-option"`), ou en re-cliquant sur le radio sélectionné (`"no-option"`) */
    hasUndefined?: "first-option" | "last-option" | "no-option";
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nom de l'input. */
    name?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value?: DomainType<T>) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<RadioCss & SelectRadioCss>;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Libellé du cas vide. */
    undefinedLabel?: string;
    /** Valeur. */
    value?: DomainType<T>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

const undefinedKey = "$$undefined$$";

/**
 * Un [`RadioGroup`](/docs/composants-focus4∕toolbox-radiobutton--docs) avec un [`RadioButton`](/docs/composants-focus4∕toolbox-radiobutton--docs) par élément d'une liste de référence.
 *
 * S'utilise avec [`selectFor`](/docs/modèle-métier-afficher-des-champs--docs#selectforfield-values-options).
 */
export function SelectRadio<const T extends DomainFieldTypeSingle>({
    disabled = false,
    error,
    hasUndefined,
    i18nPrefix = "focus",
    label,
    name,
    onChange,
    showSupportingText = "always",
    theme: pTheme,
    type,
    undefinedLabel = `${i18nPrefix}.select.none`,
    value,
    values
}: SelectRadioProps<T>) {
    const theme = useTheme<RadioCss & SelectRadioCss>("selectRadio", selectRadioCss, pTheme);
    const {$labelKey, $valueKey} = values;

    const handleChange = useCallback(
        (newValue?: string) => {
            onChange(stringToDomainType(newValue === undefinedKey ? undefined : newValue, type));
        },
        [onChange, type]
    );

    return useObserver(() => {
        let definitiveValues: any[] = values;
        if (hasUndefined === "last-option") {
            definitiveValues = [...values.slice(), {[$valueKey]: undefinedKey, [$labelKey]: undefinedLabel}];
        }
        if (hasUndefined === "first-option") {
            definitiveValues = [{[$valueKey]: undefinedKey, [$labelKey]: undefinedLabel}, ...values.slice()];
        }

        return (
            <div className={theme.select({error: !!error})}>
                {label ? <h5 className={theme.title()}>{i18next.t(label)}</h5> : null}
                <RadioGroup
                    allowUndefined={hasUndefined === "no-option"}
                    disabled={disabled === true}
                    onChange={handleChange}
                    value={value === undefined ? undefinedKey : `${value}`}
                >
                    {definitiveValues.map(option => {
                        const optVal = option[$valueKey];
                        const optLabel = option[$labelKey];

                        return (
                            <RadioButton
                                key={optVal ?? "undefined"}
                                disabled={Array.isArray(disabled) && disabled.includes(optVal)}
                                label={i18next.t(optLabel)}
                                name={`${name!}-${optVal}`}
                                theme={theme}
                                value={optVal?.toString() ?? ""}
                            />
                        );
                    })}
                </RadioGroup>
                {showSupportingText === "always" || (showSupportingText === "auto" && error) ? (
                    <div className={theme.supportingText()}>
                        <div>{error}</div>
                    </div>
                ) : null}
            </div>
        );
    });
}
