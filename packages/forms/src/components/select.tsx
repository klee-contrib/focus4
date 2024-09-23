import i18next from "i18next";
import {useObserver} from "mobx-react";

import {DomainFieldTypeSingle, DomainType, ReferenceList} from "@focus4/stores";
import {Dropdown, DropdownProps} from "@focus4/toolbox";

import {stringToDomainType} from "../utils";

/** Props du Select. */
export interface SelectProps<T extends DomainFieldTypeSingle>
    extends Omit<DropdownProps<any>, "error" | "getKey" | "getLabel" | "onChange" | "value" | "values"> {
    /** Message d'erreur à afficher. */
    error?: string;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: DomainType<T> | undefined) => void;
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
            error={!!error}
            getKey={v => `${v[$valueKey]}`}
            getLabel={v => (v[$labelKey] as string) ?? i18next.t(`${i18nPrefix}.select.noLabel`)}
            onChange={val => onChange(stringToDomainType(val, type))}
            showSupportingText={showSupportingText}
            supportingText={error ?? supportingText}
            undefinedLabel={typeof undefinedLabel === "string" ? i18next.t(undefinedLabel) : undefinedLabel}
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            value={value !== undefined ? `${value}` : undefined}
            values={values.slice()}
        />
    ));
}
