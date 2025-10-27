import {useObserver} from "mobx-react";
import {useCallback, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {output} from "zod";

import {stringToSchemaOutput, ZodTypeSingle} from "@focus4/entities";
import {ReferenceList} from "@focus4/stores";
import {Autocomplete, AutocompleteProps} from "@focus4/toolbox";

/** Props du Select. */
export interface SelectAutocompleteProps<S extends ZodTypeSingle>
    extends Omit<
        AutocompleteProps<any>,
        "disabled" | "error" | "getKey" | "getLabel" | "onChange" | "value" | "values"
    > {
    /** Désactive l'Autocomplete (si true), ou une liste d'options de l'Autocomplete (si liste de valeurs). */
    disabled?: boolean | output<S>[];
    /** Message d'erreur à afficher. */
    error?: string;
    /** Autorise la non-sélection en ajoutant une option vide. Par défaut : "true". */
    hasUndefined?: boolean;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value?: output<S>) => void;
    /** Schéma du champ (celui du domaine). */
    schema: S;
    /** Libellé de l'option vide. */
    undefinedLabel?: string;
    /** Valeur. */
    value?: output<S>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

const undefinedKey = "$$undefined$$";

/**
 * Un [`Autocomplete`](/docs/composants-focus4∕toolbox-autocomplete--docs) qui prend ses valeurs dans une liste de référence.
 *
 * S'utilise avec [`selectFor`](/docs/modèle-métier-afficher-des-champs--docs#selectforfield-values-options).
 */
export function SelectAutocomplete<const S extends ZodTypeSingle>({
    disabled,
    error,
    hasUndefined = true,
    i18nPrefix = "focus",
    onChange,
    schema,
    showSupportingText = "always",
    supportingText,
    trailing,
    undefinedLabel = `${i18nPrefix}.select.unselected`,
    value,
    values,
    ...props
}: SelectAutocompleteProps<S>) {
    const {t} = useTranslation();

    const finalValues = useMemo(
        () =>
            hasUndefined
                ? [{[values.$valueKey]: undefinedKey, [values.$labelKey]: t(undefinedLabel)}, ...values]
                : [...values],
        [hasUndefined, undefinedLabel, values, values.length]
    );

    const getKey = useCallback((v: any) => `${v[values.$valueKey]}`, [values.$valueKey]);
    const getLabel = useCallback(
        (v: any) => (v[values.$labelKey] as string) ?? t(`${i18nPrefix}.select.noLabel`),
        [i18nPrefix, values.$labelKey]
    );

    return useObserver(() => (
        <Autocomplete
            {...props}
            disabled={Array.isArray(disabled) ? disabled.map(v => `${v}`) : disabled}
            error={!!error}
            getKey={getKey}
            getLabel={getLabel}
            label={undefined}
            onChange={val => {
                val = val === undefinedKey ? undefined : val;
                onChange(stringToSchemaOutput(val, schema));
            }}
            showSupportingText={showSupportingText}
            supportingText={error ?? supportingText}
            trailing={[
                {icon: `arrow_drop_down`, error: !!error},
                ...(Array.isArray(trailing) ? trailing : trailing ? [trailing] : [])
            ]}
            value={value !== undefined ? `${value}` : undefined}
            values={finalValues}
        />
    ));
}
