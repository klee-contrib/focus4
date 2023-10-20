import i18next from "i18next";
import {useObserver} from "mobx-react";

import {ReferenceList} from "@focus4/stores";
import {Dropdown, DropdownProps} from "@focus4/toolbox";

/** Props du Select. */
export interface SelectProps<T extends "number" | "string">
    extends Omit<
        DropdownProps<any>,
        "error" | "getKey" | "getLabel" | "onChange" | "showSupportingText" | "value" | "values"
    > {
    /** Message d'erreur à afficher. */
    error?: string;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: (T extends "string" ? string : number) | undefined) => void;
    /** Type du champ (number ou string). */
    type: T;
    /** Valeur. */
    value: (T extends "string" ? string : number) | undefined;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Un composant de saisie pour choisir un élément dans une liste de référence, via un Dropdown.
 *
 * Il s'agit du composant par défaut pour [`selectFor`](model/display-fields.md#selectforfield-values-options).
 */
export function Select<T extends "number" | "string">({
    error,
    i18nPrefix = "focus",
    onChange,
    supportingText,
    type,
    value,
    values,
    undefinedLabel = `${i18nPrefix}.select.unselected`,
    ...props
}: SelectProps<T>) {
    const {$labelKey, $valueKey} = values;
    return useObserver(() => (
        <Dropdown<any>
            {...props}
            error={!!error}
            getKey={v => `${v[$valueKey]}`}
            getLabel={v => (v[$labelKey] as string) ?? i18next.t(`${i18nPrefix}.select.noLabel`)}
            onChange={val => {
                const v = type === "number" && val ? parseFloat(val) : val;
                onChange(!!v || v === 0 ? (v as any) : undefined);
            }}
            showSupportingText="always"
            supportingText={error ?? supportingText}
            undefinedLabel={typeof undefinedLabel === "string" ? i18next.t(undefinedLabel) : undefinedLabel}
            value={value !== undefined ? `${value}` : undefined}
            values={values.slice()}
        />
    ));
}
