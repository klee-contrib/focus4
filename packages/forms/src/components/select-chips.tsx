import i18next from "i18next";
import {useObserver} from "mobx-react";
import {useCallback, useMemo} from "react";

import {DomainFieldTypeMultiple, DomainType, ReferenceList, SingleDomainFieldType} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Chip, ChipCss, DropdownCss, FontIcon, Icon, TextFieldCss} from "@focus4/toolbox";

import {toSimpleType} from "../utils";

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
    /** Désactive le champ texte. */
    disabled?: boolean;
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
    theme?: CSSProp<DropdownCss & SelectChipsCss & TextFieldCss>;
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
 * Un [`Select`](/docs/composants-focus4∕forms-select--docs) qui permet de sélectionner plusieurs valeurs, affichées dans des [`Chips`](/docs/composants-focus4∕toolbox-chip--docs) positionnés sous le champ.
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
    value = [] as DomainType<T>,
    values
}: SelectChipsProps<T>) {
    const theme = useTheme<DropdownCss & SelectChipsCss & TextFieldCss>("selectChips", selectChipsCss, pTheme);

    const handleRemoveValue = useCallback(
        function handleRemoveValue(v: DomainType<SingleDomainFieldType<T>>) {
            onChange(value.filter(i => i !== v) as DomainType<T>);
        },
        [onChange, value]
    );

    const handleAddValue = useCallback(
        function handleAddValue(v?: DomainType<SingleDomainFieldType<T>>) {
            const hasValue = v !== undefined && (value as DomainType<SingleDomainFieldType<T>>[]).includes(v);

            if (
                v !== undefined &&
                !hasValue &&
                (!maxSelectable || value.length < maxSelectable) &&
                values.some(i => i[values.$valueKey] === v)
            ) {
                onChange([...value, v] as DomainType<T>);
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
            tooltip: i18next.t(`${i18nPrefix}.select.unselectAll`),
            noFocusOnClick: true
        };

        if (hasSelectAll) {
            return [
                {
                    icon: {i18nKey: `${i18nPrefix}.icons.select.selectAll`},
                    onClick: handleAddAll,
                    tooltip: i18next.t(`${i18nPrefix}.select.selectAll`),
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
            const selected = (value as any).includes(item[values.$valueKey]);
            return (
                <span className={theme.line({selected})}>
                    {item[values.$labelKey]}
                    {selected ? <FontIcon iconI18nKey={`${i18nPrefix}.icons.select.selected`} /> : null}
                </span>
            );
        };
    }, [i18nPrefix, keepSelectedValuesInSelect, value, values]);

    const finalValues = useMemo(
        () =>
            values.filter(
                v =>
                    (keepSelectedValuesInSelect ||
                        !(value as (boolean | number | string)[]).includes(v[values.$valueKey])) &&
                    !unselectable?.(v)
            ),
        [keepSelectedValuesInSelect, unselectable, value, values, values.length]
    );

    return useObserver(() => (
        <div className={theme.select({error: !!error})}>
            {autocomplete ? (
                <SelectAutocomplete
                    allowUnmatched
                    clearQueryOnChange
                    direction={direction}
                    disabled={disabled}
                    error={error}
                    hasUndefined={false}
                    icon={icon}
                    id={id}
                    LineComponent={LineComponent}
                    name={name}
                    noCloseOnChange={keepSelectedValuesInSelect}
                    onChange={handleAddValue}
                    showSupportingText="never"
                    theme={theme}
                    trailing={trailing}
                    type={toSimpleType(type)}
                    values={finalValues}
                />
            ) : (
                <Select
                    direction={direction}
                    disableArrowSelectionWhenClosed
                    disabled={disabled}
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
            {value.length > 0 ? (
                <div className={theme.chips()}>
                    {value.map(item => (
                        <Chip
                            key={`${item}`}
                            className={theme.chip()}
                            color="light"
                            disabled={disabled}
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
            {showSupportingText === "always" || (showSupportingText === "auto" && error) ? (
                <div className={theme.supportingText()}>
                    <div id={id ? `${id}-st` : undefined}>{error}</div>
                </div>
            ) : null}
        </div>
    ));
}
