import {useObserver} from "mobx-react";
import {useTranslation} from "react-i18next";
import {output} from "zod";

import {stringToSchemaOutput} from "@focus4/forms";
import {ReferenceList, ZodTypeSingle} from "@focus4/stores";
import {Dropdown, DropdownProps} from "@focus4/toolbox";

/** Props du Select. */
export interface SelectProps<S extends ZodTypeSingle>
    extends Omit<
        DropdownProps<any>,
        "disabled" | "error" | "getKey" | "getLabel" | "label" | "onChange" | "value" | "values"
    > {
    /** Désactive la Dropdown (si true), ou une liste d'options de la Dropdown (si liste de valeurs). */
    disabled?: boolean | output<S>[];
    /** Message d'erreur à afficher. */
    error?: string;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value?: output<S>) => void;
    /** Schéma du champ (celui du domaine). */
    schema: S;
    /** Valeur. */
    value?: output<S>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Surcharge du [`Dropdown`](/docs/composants-focus4∕toolbox-dropdown--docs) de `@focus4/toolbox` pour fonctionner avec une liste de référence.
 *
 * Il s'agit du [composant par défaut de tous les domaines de type `string`, `number` et `boolean`](/docs/docs/composants-composants-par-défaut--docs) pour [`selectFor`](/docs/modèle-métier-afficher-des-champs--docs#selectforfield-values-options) (`SelectComponent`).
 */
export function Select<const S extends ZodTypeSingle>({
    disabled,
    error,
    i18nPrefix = "focus",
    onChange,
    schema,
    showSupportingText = "always",
    supportingText,
    value,
    values,
    undefinedLabel = `${i18nPrefix}.select.unselected`,
    ...props
}: SelectProps<S>) {
    const {t} = useTranslation();
    const {$labelKey, $valueKey} = values;
    return useObserver(() => (
        <Dropdown
            {...props}
            disabled={Array.isArray(disabled) ? disabled.map(v => `${v}`) : disabled}
            error={!!error}
            label={undefined}
            getKey={v => `${v[$valueKey]}`}
            getLabel={v => (v[$labelKey] as string) ?? t(`${i18nPrefix}.select.noLabel`)}
            onChange={val => onChange(stringToSchemaOutput(val, schema))}
            showSupportingText={showSupportingText}
            supportingText={error ?? supportingText}
            undefinedLabel={typeof undefinedLabel === "string" ? t(undefinedLabel) : undefinedLabel}
            value={value !== undefined ? `${value}` : undefined}
            values={[...values]}
        />
    ));
}
