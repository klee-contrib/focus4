import {observable} from "mobx";
import {useObserver} from "mobx-react";
import {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {output} from "zod";

import {SingleZodType, ZodTypeMultiple} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {AutocompleteCss, Chip, ChipCss, Icon, SupportingText, SupportingTextCss, TextFieldCss} from "@focus4/toolbox";

import {AutocompleteSearch} from "./autocomplete";
import {SelectChipsCss, selectChipsCss} from "./select-chips";

export interface AutocompleteChipsProps<S extends ZodTypeMultiple, TSource = {key: string; label: string}> {
    /** CSS pour les Chips. */
    chipTheme?: CSSProp<ChipCss>;
    /** Précise dans quel sens les suggestions doivent s'afficher. Par défaut : "auto". */
    direction?: "auto" | "down" | "up";
    /** Désactive l'Autocomplete (si true), ou une liste d'options de l'Autocomplete (si liste de valeurs). */
    disabled?: boolean | output<S>;
    /** Message d'erreur à afficher. */
    error?: string;
    /**
     * Détermine la propriété de l'objet a utiliser comme clé.
     * Par défaut : `item => item.key`
     */
    getKey?: (item: TSource) => string;
    /**
     * Détermine la propriété de l'objet à utiliser comme libellé.
     * Le libellé de l'objet est le texte utilisé pour chercher la correspondance avec le texte saisi dans le champ.
     * Par défaut : `item => item.label`
     */
    getLabel?: (item: TSource) => string;
    /** Service de résolution de clé. Doit retourner le libellé. */
    keyResolver?: (key: output<SingleZodType<S>>) => Promise<string | undefined>;
    /** Placeholder pour le champ texte. */
    hint?: string;
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
    onChange: (value?: output<S>) => void;
    /** Service de recherche. */
    querySearcher?: (text: string, options?: RequestInit) => Promise<TSource[]>;
    /** Délai (en ms) entre la fin de la saisie de l'utilisateur et le lancement de la recherche. Par défaut : 500.  */
    searchDelay?: number;
    /** Active l'appel à la recherche si le champ est vide. */
    searchOnEmptyQuery?: boolean;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** Schéma du champ (celui du domaine). */
    schema: S;
    /** CSS. */
    theme?: CSSProp<AutocompleteCss & SelectChipsCss & TextFieldCss & SupportingTextCss>;
    /** Empêche la suppression des valeurs correspondants à ce filtre. */
    undeletable?: (value: output<SingleZodType<S>>) => boolean;
    /** Valeur. */
    value?: output<S>;
}

const defaultGetKey = (x: any) => x.key;

/**
 * Un [`AutocompleteSearch`](/docs/composants-focus4∕form-toolbox-autocompletesearch--docs) qui permet de sélectionner plusieurs valeurs, affichées dans des [`Chips`](/docs/composants-focus4∕toolbox-chip--docs) positionnés sous le champ.
 *
 * Il s'agit du composant par défaut de tous les domaines listes (`"boolean-array"`,`"number-array"` et `"string-array"`) pour [`autocompleteFor`](/docs/modèle-métier-afficher-des-champs--docs#autocompleteforfield-options) (`AutocompleteComponent`).
 */
export function AutocompleteChips<const S extends ZodTypeMultiple, TSource = {key: string; label: string}>({
    chipTheme,
    direction,
    disabled = false,
    error,
    hint,
    i18nPrefix = "focus",
    icon,
    id,
    getKey = defaultGetKey,
    getLabel,
    keyResolver,
    maxSelectable,
    name,
    onChange,
    querySearcher,
    schema,
    searchDelay = 500,
    searchOnEmptyQuery = false,
    showSupportingText = "always",
    theme: pTheme,
    undeletable,
    value
}: AutocompleteChipsProps<S, TSource>) {
    const {t} = useTranslation();
    const theme = useTheme<AutocompleteCss & SelectChipsCss & TextFieldCss & SupportingTextCss>(
        "selectChips",
        selectChipsCss,
        pTheme
    );

    const [labels] = useState(() => observable.map<boolean | number | string, string>());

    useEffect(() => {
        if (keyResolver) {
            for (const item of (value ?? []).filter(i => !labels.has(i))) {
                keyResolver(item as output<SingleZodType<S>>).then(label => labels.set(item, label ?? `${item}`));
            }
        }
    }, [keyResolver, value]);

    const handleAddValue = useCallback(
        function handleAddValue(v?: boolean | number | string) {
            if (v && (!maxSelectable || (value?.length ?? 0) < maxSelectable)) {
                onChange([...(value ?? []), v] as output<S>);
            }
        },
        [onChange, maxSelectable, value]
    );

    const handleRemoveValue = useCallback(
        function handleRemoveValue(v: boolean | number | string) {
            onChange((value ?? []).filter(i => i !== v) as output<S>);
        },
        [onChange, value]
    );

    const handleRemoveAll = useCallback(
        function handleRemoveAll() {
            onChange([] as output<S>);
        },
        [onChange]
    );

    const fixedQuerySearcher = useCallback(
        async function fixedQuerySearcher(query: string, options?: RequestInit) {
            if (querySearcher) {
                const results = await querySearcher(query, options);
                return results.filter(r => !(value ?? []).includes(getKey(r) as never));
            } else {
                return [];
            }
        },

        [getKey, querySearcher, value]
    );

    return useObserver(() => (
        <div className={theme.select()}>
            <AutocompleteSearch<S["element"], TSource>
                clearQueryOnChange
                direction={direction}
                disabled={disabled as any}
                error={error}
                getKey={getKey}
                getLabel={getLabel}
                hint={hint}
                icon={icon}
                id={id}
                keyResolver={keyResolver}
                name={name}
                onChange={handleAddValue}
                querySearcher={fixedQuerySearcher}
                schema={schema.element}
                searchDelay={searchDelay}
                searchOnEmptyQuery={searchOnEmptyQuery}
                showSupportingText="never"
                theme={theme}
                trailing={{
                    icon: {i18nKey: `${i18nPrefix}.icons.select.unselectAll`},
                    onClick: handleRemoveAll,
                    tooltip: t(`${i18nPrefix}.select.unselectAll`),
                    noFocusOnClick: true
                }}
            />
            {value?.length ? (
                <div className={theme.chips()}>
                    {value.map(item => (
                        <Chip
                            key={`${item}`}
                            className={theme.chip()}
                            color="light"
                            disabled={disabled === true}
                            label={labels.get(item) ?? ""}
                            onDeleteClick={
                                !undeletable?.(item as output<SingleZodType<S>>)
                                    ? () => handleRemoveValue(item)
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
