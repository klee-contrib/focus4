import i18next from "i18next";
import {useObserver} from "mobx-react";

import {stringToDomainType} from "@focus4/forms";
import {DomainFieldTypeSingle, DomainType, ReferenceList} from "@focus4/stores";
import {Dropdown, DropdownProps} from "@focus4/toolbox";

/** Props du Select. */
export interface SelectProps<T extends DomainFieldTypeSingle>
    extends Omit<DropdownProps<any>, "disabled" | "error" | "getKey" | "getLabel" | "onChange" | "value" | "values"> {
    /** Désactive la Dropdown (si true), ou une liste d'options de la Dropdown (si liste de valeurs). */
    disabled?: boolean | DomainType<T>[];
    /** Message d'erreur à afficher. */
    error?: string;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value?: DomainType<T>) => void;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Valeur. */
    value?: DomainType<T>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Surcharge du [`Dropdown`](/docs/composants-focus4∕toolbox-dropdown--docs) de `@focus4/toolbox` pour fonctionner avec une liste de référence.
 *
 * Il s'agit du composant par défaut de tous les domaines simples (`"boolean"`,`"number"` et `"string"`) pour [`selectFor`](/docs/modèle-métier-afficher-des-champs--docs#selectforfield-values-options) (`SelectComponent`).
 */
export function Select<const T extends DomainFieldTypeSingle>({
    disabled,
    error,
    i18nPrefix = "focus",
    onChange,
    showSupportingText = "always",
    supportingText,
    type,
    value,
    values,
    undefinedLabel = `${i18nPrefix}.select.unselected`,
    ...props
}: SelectProps<T>) {
    const {$labelKey, $valueKey} = values;
    return useObserver(() => (
        <Dropdown
            {...props}
            disabled={Array.isArray(disabled) ? disabled.map(v => `${v}`) : disabled}
            error={!!error}
            getKey={v => `${v[$valueKey]}`}
            getLabel={v => (v[$labelKey] as string) ?? i18next.t(`${i18nPrefix}.select.noLabel`)}
            onChange={val => onChange(stringToDomainType(val, type))}
            showSupportingText={showSupportingText}
            supportingText={error ?? supportingText}
            undefinedLabel={typeof undefinedLabel === "string" ? i18next.t(undefinedLabel) : undefinedLabel}
            value={value !== undefined ? `${value}` : undefined}
            values={values.slice()}
        />
    ));
}
