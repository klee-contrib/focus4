import i18next from "i18next";
import {useObserver} from "mobx-react";
import {useCallback, useMemo} from "react";

import {DomainFieldType, DomainTypeMultiple, ReferenceList} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Chip, ChipCss, DropdownCss, Icon, TextFieldCss} from "@focus4/toolbox";

import {Select} from "./select";
import {toSimpleType} from "./utils";

import selectChipsCss, {SelectChipsCss} from "./__style__/select-chips.css";
export {selectChipsCss, SelectChipsCss};

export interface SelectChipsProps<T extends DomainFieldType> {
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
    onChange: (value: DomainTypeMultiple<T>) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** CSS. */
    theme?: CSSProp<DropdownCss & SelectChipsCss & TextFieldCss>;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Retire les valeurs qui correspondent à ce filtre des valeurs sélectionnables dans le Select. */
    unselectable?: (value: any) => boolean;
    /** Valeur. */
    value?: DomainTypeMultiple<T>;
    /** Liste des valeurs. */
    values: ReferenceList;
}

/**
 * Un [`Select`](/docs/composants-focus4∕forms-select--docs) qui permet de sélectionner plusieurs valeurs, affichées dans des [`Chips`](/docs/composants-focus4∕toolbox-chip--docs) positionnés sous le champ.
 *
 * S'utilise avec [`selectFor`](/docs/modèle-métier-afficher-des-champs--docs#selectforfield-values-options) sur un champ liste.
 */
export function SelectChips<T extends DomainFieldType>({
    chipTheme,
    direction,
    disabled = false,
    error,
    hasSelectAll = false,
    i18nPrefix = "focus",
    icon,
    id,
    maxSelectable,
    name,
    onChange,
    showSupportingText = "always",
    theme: pTheme,
    type,
    unselectable,
    value = [] as DomainTypeMultiple<T>,
    values
}: SelectChipsProps<T>) {
    const theme = useTheme<DropdownCss & SelectChipsCss & TextFieldCss>("selectChips", selectChipsCss, pTheme);

    const handleAddValue = useCallback(
        function handleAddValue(v?: boolean | number | string) {
            if (v && (!maxSelectable || value.length < maxSelectable)) {
                onChange?.([...value, v] as DomainTypeMultiple<T>);
            }
        },
        [onChange, maxSelectable, value]
    );

    const handleRemoveValue = useCallback(
        function handleRemoveValue(v: boolean | number | string) {
            onChange?.(value.filter(i => i !== v) as DomainTypeMultiple<T>);
        },
        [onChange, value]
    );

    const handleAddAll = useCallback(
        function handleRemoveAll() {
            onChange?.(values.map(i => i[values.$valueKey]) as DomainTypeMultiple<T>);
        },
        [onChange, values]
    );

    const handleRemoveAll = useCallback(
        function handleRemoveAll() {
            onChange?.([] as DomainTypeMultiple<T>);
        },
        [onChange]
    );

    const trailing = useMemo(() => {
        const clear = {
            icon: {i18nKey: `${i18nPrefix}.icons.select.unselectAll`},
            onClick: handleRemoveAll,
            tooltip: i18next.t(`${i18nPrefix}.select.unselectAll`),
            blurOnClick: true
        };

        if (hasSelectAll) {
            return [
                {
                    icon: {i18nKey: `${i18nPrefix}.icons.select.selectAll`},
                    onClick: handleAddAll,
                    tooltip: i18next.t(`${i18nPrefix}.select.selectAll`),
                    blurOnClick: true
                },
                clear
            ];
        } else {
            return clear;
        }
    }, [handleAddAll, handleRemoveAll, hasSelectAll, i18nPrefix]);

    return useObserver(() => (
        <div className={theme.select({error: !!error})}>
            <Select
                direction={direction}
                disableArrowSelectionWhenClosed
                disabled={disabled}
                error={error}
                icon={icon}
                id={id}
                name={name}
                onChange={handleAddValue}
                showSupportingText="never"
                theme={theme}
                trailing={trailing}
                type={toSimpleType(type)}
                values={values.filter(
                    v => !(value as (boolean | number | string)[]).includes(v[values.$valueKey]) && !unselectable?.(v)
                )}
            />
            {value.length > 0 ? (
                <div className={theme.chips()}>
                    {value.map(item => (
                        <Chip
                            key={`${item}`}
                            className={theme.chip()}
                            color="light"
                            disabled={disabled}
                            label={values.getLabel(item)}
                            onDeleteClick={() => handleRemoveValue(item)}
                            theme={chipTheme}
                        />
                    ))}
                </div>
            ) : null}
            {showSupportingText === "always" || (showSupportingText === "auto" && error) ? (
                <div className={theme.supportingText()}>{error}</div>
            ) : null}
        </div>
    ));
}
