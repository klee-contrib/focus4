import {debounce} from "lodash";
import {ForwardedRef, forwardRef, ReactElement, useCallback, useEffect, useState} from "react";

import {DomainFieldTypeSingle, DomainType} from "@focus4/stores";
import {Autocomplete, AutocompleteProps} from "@focus4/toolbox";

import {stringToDomainType} from "../utils";

export interface AutocompleteSearchProps<T extends DomainFieldTypeSingle, TSource = {key: string; label: string}>
    extends Omit<
        AutocompleteProps<TSource>,
        | "disabled"
        | "error"
        | "loading"
        | "noSuggestionsOnEmptyQuery"
        | "onChange"
        | "suggestionMatch"
        | "value"
        | "values"
    > {
    /** Désactive l'Autocomplete (si true), ou une liste d'options de l'Autocomplete (si liste de valeurs). */
    disabled?: boolean | DomainType<T>[];
    /** Erreur à afficher sous le champ. */
    error?: string;
    /** Service de résolution de clé. Doit retourner le libellé. */
    keyResolver?: (key: DomainType<T>) => Promise<string | undefined>;
    /**
     * Appelé à la sélection d'une valeur.
     *
     * En plus de passer la valeur choisie comme tout composant de saisie, le composant envoie aussi en second paramètre l'objet source entier qui correspond à cette valeur.
     * Même si la signature de `onChange` de `autocompleteFor` ne vous le dit pas, vous pouvez quand même la récupérer par ici dans votre composant.
     */
    onChange: (key: DomainType<T> | undefined, value?: TSource) => void;
    /** Service de recherche. */
    querySearcher?: (text: string) => Promise<TSource[]>;
    /** Active l'appel à la recherche si le champ est vide. */
    searchOnEmptyQuery?: boolean;
    /** Rappelle la recherche quand le `querySearcher` change (nécessite un `querySearcher` stable). */
    searchOnQuerySearcherChange?: boolean;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Valeur. */
    value?: DomainType<T>;
}

const defaultGetKey = (x: any) => x.key;

/**
 * Un [`Autocomplete`](/docs/composants-focus4∕toolbox-autocomplete--docs) qui récupère ses suggestions à partir **d'un service de recherche** au lieu d'une liste pré-chargée.
 * Aucun filtre supplémentaire ne sera réalisé dans le composant.
 *
 * Il s'agit du composant par défaut de tous les domaines simples (`"boolean"`,`"number"` et `"string"`) pour [`autocompleteFor`](/docs/modèle-métier-afficher-des-champs--docs#autocompleteforfield-options) (`AutocompleteComponent`).
 */
export const AutocompleteSearch = forwardRef(function AutocompleteSearch<
    const T extends DomainFieldTypeSingle,
    TSource = {key: string; label: string}
>(
    {
        disabled,
        error,
        getKey = defaultGetKey,
        keyResolver,
        onChange,
        onQueryChange,
        query: pQuery = "",
        querySearcher,
        searchOnEmptyQuery = false,
        searchOnQuerySearcherChange = false,
        supportingText,
        showSupportingText = "always",
        type,
        value,
        ...props
    }: AutocompleteSearchProps<T, TSource>,
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
    const [query, setQuery] = useState(pQuery);
    useEffect(() => setQuery(pQuery), [pQuery]);

    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState<TSource[]>([]);

    useEffect(() => {
        if ((!!value || value === 0) && (!!keyResolver || !!pQuery)) {
            setLoading(true);
            (keyResolver
                ? keyResolver(value)
                : new Promise<string>(r => {
                      r(pQuery);
                  })
            ).then(async label => {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                setQuery(label ?? `${value}`);
                if (!values.find(v => getKey(v) === value) && label && querySearcher) {
                    setValues(await querySearcher(label));
                }
                setLoading(false);
            });
        }
    }, [value]);

    const search = useCallback(
        debounce(async function search(newQuery: string) {
            if (querySearcher && (searchOnEmptyQuery || newQuery.trim().length)) {
                setLoading(true);
                setValues(await querySearcher(newQuery.trim()));
                setLoading(false);
            }
        }, 200),
        [querySearcher, searchOnEmptyQuery]
    );

    useEffect(() => {
        if (searchOnQuerySearcherChange && query) {
            setValues([]);
            search(query);
        }
    }, [search, searchOnQuerySearcherChange]);

    function handleQueryChange(newQuery: string) {
        setQuery(newQuery);
        onQueryChange?.(newQuery);

        if (!newQuery && !searchOnEmptyQuery) {
            setValues([]);
        }

        search(newQuery);
    }

    function handleChange(newKey?: string, newValue?: TSource) {
        onChange?.(stringToDomainType(newKey, type), newValue);
    }

    function handleFocus() {
        if (searchOnEmptyQuery && !values.length) {
            search(query);
        }
    }

    return (
        <Autocomplete
            {...props}
            ref={ref}
            disabled={Array.isArray(disabled) ? disabled.map(v => `${v}`) : disabled}
            error={!!error}
            getKey={getKey}
            loading={loading}
            noSuggestionsOnEmptyQuery={!searchOnEmptyQuery}
            onChange={handleChange}
            onFocus={handleFocus}
            onQueryChange={handleQueryChange}
            query={query}
            showSupportingText={showSupportingText}
            suggestionMatch="disabled"
            supportingText={error ?? supportingText}
            value={value !== undefined ? `${value}` : undefined}
            values={values}
        />
    );
}) as <const T extends DomainFieldTypeSingle, TSource = {key: string; label: string}>(
    props: AutocompleteSearchProps<T, TSource> & {ref?: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
) => ReactElement;
