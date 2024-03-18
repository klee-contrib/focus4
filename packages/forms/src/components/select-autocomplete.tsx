import i18next from "i18next";
import {useObserver} from "mobx-react";
import {useCallback, useMemo} from "react";

import {DomainFieldType, DomainTypeSingle, ReferenceList} from "@focus4/stores";
import {Autocomplete, AutocompleteProps} from "@focus4/toolbox";

import {stringToDomainType} from "./utils";

/** Props du Select. */
export interface SelectAutocompleteProps<T extends DomainFieldType>
    extends Omit<AutocompleteProps<any>, "error" | "getKey" | "getLabel" | "onChange" | "value" | "values"> {
    /** Message d'erreur à afficher. */
    error?: string;
    /** Autorise la non-sélection en ajoutant une option vide. Par défaut : "true". */
    hasUndefined?: boolean;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Est appelé à chaque changement de valeur. */
    onChange: (value: DomainTypeSingle<T> | undefined) => void;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Libellé de l'option vide. */
    undefinedLabel?: string;
    /** Valeur. */
    value?: DomainTypeSingle<T>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

const undefinedKey = "$$undefined$$";

/**
 * Un [`Autocomplete`](/docs/composants-focus4∕toolbox-autocomplete--docs) qui prend ses valeurs dans une liste de référence.
 *
 * S'utilise avec [`selectFor`](/docs/modèle-métier-afficher-des-champs--docs#selectforfield-values-options).
 */
export function SelectAutocomplete<T extends DomainFieldType>({
    error,
    hasUndefined = true,
    i18nPrefix = "focus",
    onChange,
    showSupportingText = "always",
    supportingText,
    trailing,
    type,
    undefinedLabel = `${i18nPrefix}.select.unselected`,
    value,
    values,
    ...props
}: SelectAutocompleteProps<T>) {
    const finalValues = useMemo(
        () =>
            hasUndefined
                ? [{[values.$valueKey]: undefinedKey, [values.$labelKey]: i18next.t(undefinedLabel)}, ...values]
                : values.slice(),
        [hasUndefined, undefinedLabel, values]
    );

    const getKey = useCallback((v: any) => `${v[values.$valueKey]}`, [values.$valueKey]);
    const getLabel = useCallback(
        (v: any) => (v[values.$labelKey] as string) ?? i18next.t(`${i18nPrefix}.select.noLabel`),
        [i18nPrefix, values.$labelKey]
    );

    return useObserver(() => (
        <Autocomplete
            {...props}
            error={!!error}
            getKey={getKey}
            getLabel={getLabel}
            onChange={val => {
                val = val === undefinedKey ? undefined : val;
                onChange(stringToDomainType(val, type));
            }}
            showSupportingText={showSupportingText}
            supportingText={error ?? supportingText}
            trailing={[
                {icon: `arrow_drop_down`, error: !!error},
                ...(Array.isArray(trailing) ? trailing : trailing ? [trailing] : [])
            ]}
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            value={value !== undefined ? `${value}` : undefined}
            values={finalValues}
        />
    ));
}
