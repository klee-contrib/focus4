import {useObserver} from "mobx-react";
import {useCallback, useMemo} from "react";
import {useTranslation} from "react-i18next";

import {toSimpleType} from "@focus4/forms";
import {DomainFieldTypeMultiple, DomainType, ReferenceList, SingleDomainFieldType} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {
    Chip,
    ChipCss,
    DropdownCss,
    FontIcon,
    Icon,
    SupportingText,
    SupportingTextCss,
    TextFieldCss
} from "@focus4/toolbox";

import {Select} from "./select";
import {SelectAutocomplete} from "./select-autocomplete";

import selectChipsCss, {SelectChipsCss} from "./__style__/select-chips.css";

export {selectChipsCss};
export type {SelectChipsCss};

export interface SelectChipsProps<T extends DomainFieldTypeMultiple> {
    /** Si renseigné, utilise un `SelectAutocomplete` à la place d'un `Select`. */
    autocomplete?: boolean;
    /** CSS pour les Chips. */
    chipTheme?: CSSProp<ChipCss>;
    /** Précise dans quel sens les suggestions doivent s'afficher. Par défaut : "auto". */
    direction?: "auto" | "down" | "up";
    /** Désactive le Select (si true), ou une liste d'options du Select (si liste de valeurs). */
    disabled?: boolean | DomainType<T>;
    /** Message d'erreur à afficher. */
    error?: string;
    /** Permet la sélection de tous les éléments à la fois. */
    hasSelectAll?: boolean;
    /** Laisse les valeurs sélectionnées dans le Select au lieu de les retirer. */
    keepSelectedValuesInSelect?: boolean;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Icône à poser devant le texte. */
    icon?: Icon;
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
    /**
     * Contrôle la mise en forme du Dropdown :
     * - `fit-to-field-and-wrap` va forcer la largeur du menu sur la largeur du champ, et faire des retours à la ligne si nécessaire. (par défaut).
     * - `fit-to-field-single-line` force également la largeur du menu sur la largeur du champ, mais le texte sera coupé avec une ellipse au lieu de revenir à la ligne.
     * - `no-fit-single-line` laisse le champ et le menu avec leurs largeurs respectives, sans retour à la ligne.
     * - `fit-to-values` force la largeur du champ sur la largeur des valeurs, sans retour à la ligne.
     */
    sizing?: "fit-to-field-and-wrap" | "fit-to-field-single-line" | "fit-to-values" | "no-fit-single-line";
    /** CSS. */
    theme?: CSSProp<DropdownCss & SelectChipsCss & TextFieldCss & SupportingTextCss>;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Empêche la suppression des valeurs correspondants à ce filtre. */
    undeletable?: (value: DomainType<SingleDomainFieldType<T>>) => boolean;
    /** Retire les valeurs qui correspondent à ce filtre des valeurs sélectionnables dans le Select. */
    unselectable?: (value: any) => boolean;
    /** Valeur. */
    value?: DomainType<T>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Un [`Select`](/docs/composants-focus4∕form-toolbox-select--docs) qui permet de sélectionner plusieurs valeurs, affichées dans des [`Chips`](/docs/composants-focus4∕toolbox-chip--docs) positionnés sous le champ.
 *
 * Il s'agit du composant par défaut de tous les domaines listes (`"boolean-array"`,`"number-array"` et `"string-array"`) pour [`selectFor`](/docs/modèle-métier-afficher-des-champs--docs#selectforfield-values-options) (`SelectComponent`).
 */
export function SelectChips<const T extends DomainFieldTypeMultiple>({
    autocomplete = false,
    chipTheme,
    direction,
    disabled = false,
    error,
    hasSelectAll = false,
    keepSelectedValuesInSelect = false,
    i18nPrefix = "focus",
    icon,
    id,
    maxSelectable,
    name,
    onChange,
    showSupportingText = "always",
    sizing,
    theme: pTheme,
    type,
    undeletable,
    unselectable,
    value,
    values
}: SelectChipsProps<T>) {
    const {t} = useTranslation();
    const theme = useTheme<DropdownCss & SelectChipsCss & TextFieldCss & SupportingTextCss>(
        "selectChips",
        selectChipsCss,
        pTheme
    );

    const handleRemoveValue = useCallback(
        function handleRemoveValue(v: DomainType<SingleDomainFieldType<T>>) {
            onChange((value?.filter(i => i !== v) as DomainType<T>) ?? []);
        },
        [onChange, value]
    );

    const handleAddValue = useCallback(
        function handleAddValue(v?: DomainType<SingleDomainFieldType<T>>) {
            const hasValue = v !== undefined && (value ?? []).includes(v as never);

            if (
                v !== undefined &&
                !hasValue &&
                (!maxSelectable || (value?.length ?? 0) < maxSelectable) &&
                values.some(i => i[values.$valueKey] === v)
            ) {
                onChange([...(value ?? []), v] as DomainType<T>);
            } else if (hasValue) {
                handleRemoveValue(v);
            }
        },
        [handleRemoveValue, maxSelectable]
    );

    const handleAddAll = useCallback(
        function handleRemoveAll() {
            onChange(values.map(i => i[values.$valueKey]) as DomainType<T>);
        },
        [onChange, values]
    );

    const handleRemoveAll = useCallback(
        function handleRemoveAll() {
            onChange([] as DomainType<T>);
        },
        [onChange]
    );

    const trailing = useMemo(() => {
        const clear = {
            icon: {i18nKey: `${i18nPrefix}.icons.select.unselectAll`},
            onClick: handleRemoveAll,
            tooltip: t(`${i18nPrefix}.select.unselectAll`),
            noFocusOnClick: true
        };

        if (hasSelectAll) {
            return [
                {
                    icon: {i18nKey: `${i18nPrefix}.icons.select.selectAll`},
                    onClick: handleAddAll,
                    tooltip: t(`${i18nPrefix}.select.selectAll`),
                    noFocusOnClick: true
                },
                clear
            ];
        } else {
            return clear;
        }
    }, [handleAddAll, handleRemoveAll, hasSelectAll, i18nPrefix]);

    const LineComponent = useMemo(() => {
        if (!keepSelectedValuesInSelect) {
            return undefined;
        }

        return function SelectChipsLineComponent({item}: any) {
            const selected = (value ?? []).includes(item[values.$valueKey] as never);
            return (
                <span
                    className={theme.line({fittedSelect: !autocomplete && sizing !== "no-fit-single-line", selected})}
                >
                    {item[values.$labelKey]}
                    <FontIcon iconI18nKey={`${i18nPrefix}.icons.select.selected`} />
                </span>
            );
        };
    }, [autocomplete, i18nPrefix, keepSelectedValuesInSelect, sizing, value, values]);

    const finalValues = useMemo(
        () =>
            values.filter(
                v =>
                    (keepSelectedValuesInSelect || !(value ?? []).includes(v[values.$valueKey] as never)) &&
                    !unselectable?.(v)
            ),
        [keepSelectedValuesInSelect, unselectable, value, values, values.length]
    );

    return useObserver(() => (
        <div className={theme.select()}>
            {autocomplete ? (
                <SelectAutocomplete
                    allowUnmatched
                    clearQueryOnChange
                    direction={direction}
                    disabled={disabled as any}
                    error={error}
                    hasUndefined={false}
                    icon={icon}
                    id={id}
                    LineComponent={LineComponent}
                    name={name}
                    noCloseOnChange={keepSelectedValuesInSelect}
                    onChange={handleAddValue}
                    showSupportingText="never"
                    sizing={sizing === "no-fit-single-line" ? sizing : "fit-to-field-single-line"}
                    theme={theme}
                    trailing={trailing}
                    type={toSimpleType(type)}
                    values={finalValues}
                />
            ) : (
                <Select
                    direction={direction}
                    disableArrowSelectionWhenClosed
                    disabled={disabled as any}
                    error={error}
                    hideUndefined
                    icon={icon}
                    id={id}
                    LineComponent={LineComponent}
                    name={name}
                    noCloseOnChange={keepSelectedValuesInSelect}
                    onChange={handleAddValue}
                    showSupportingText="never"
                    sizing={sizing}
                    theme={theme}
                    trailing={trailing}
                    type={toSimpleType(type)}
                    values={finalValues}
                />
            )}
            {value?.length ? (
                <div className={theme.chips()}>
                    {value.map(item => (
                        <Chip
                            key={`${item}`}
                            className={theme.chip()}
                            color="light"
                            disabled={disabled === true}
                            label={values.getLabel(item)}
                            onDeleteClick={
                                !undeletable?.(item as DomainType<SingleDomainFieldType<T>>)
                                    ? () => handleRemoveValue(item as DomainType<SingleDomainFieldType<T>>)
                                    : undefined
                            }
                            theme={chipTheme}
                        />
                    ))}
                </div>
            ) : null}
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
