import {debounce} from "lodash";
import {ForwardedRef, forwardRef, ReactElement, useCallback, useEffect, useState} from "react";

import {Autocomplete, AutocompleteProps} from "@focus4/toolbox";

export interface AutocompleteSearchProps<T extends "number" | "string", TSource = {key: string; label: string}>
    extends Omit<
        AutocompleteProps<TSource>,
        "error" | "loading" | "onChange" | "showSupportingText" | "suggestionMatch" | "value" | "values"
    > {
    /** Erreur à afficher sous le champ. */
    error?: string;
    /** Service de résolution de clé. Doit retourner le libellé. */
    keyResolver?: (key: T extends "string" ? string : number) => Promise<string | undefined>;
    /** Au changement. */
    onChange?: (value: (T extends "string" ? string : number) | undefined) => void;
    /** Service de recherche. */
    querySearcher?: (text: string) => Promise<TSource[]>;
    /** Active l'appel à la recherche si le champ est vide. */
    searchOnEmptyQuery?: boolean;
    /** Type du champ ("string" ou "number"). */
    type: T;
    /** Valeur. */
    value?: (T extends "string" ? string : number) | undefined;
}

const defaultGetKey = (x: any) => x.key;

/**
 * Champ de saisie en autocomplétion à partir d'un **service de recherche**.
 *
 * Il s'agit du composant par défaut de `autocompleteFor`.
 */
export const AutocompleteSearch = forwardRef(function AutocompleteSearch<
    T extends "number" | "string",
    TSource = {key: string; label: string}
>(
    {
        error,
        getKey = defaultGetKey,
        keyResolver,
        onChange,
        onQueryChange,
        query: pQuery = "",
        querySearcher,
        searchOnEmptyQuery,
        supportingText,
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
        if ((!!value || value === 0) && keyResolver) {
            setLoading(true);
            keyResolver(value).then(async label => {
                setQuery(label ?? `${value}`);
                if (!values.find(v => getKey(v) === value) && label && querySearcher) {
                    setValues(await querySearcher(encodeURIComponent(label)));
                }
                setLoading(false);
            });
        }
    }, [value]);

    const search = useCallback(
        debounce(async function search(newQuery: string) {
            if (querySearcher && (searchOnEmptyQuery ?? newQuery.trim().length)) {
                setLoading(true);
                const result = await querySearcher(encodeURIComponent(newQuery.trim()));
                setValues(result);
                setLoading(false);
            }
        }, 200),
        [querySearcher, searchOnEmptyQuery]
    );

    function handleQueryChange(newQuery: string) {
        setQuery(newQuery);
        onQueryChange?.(newQuery);

        if (!newQuery && !searchOnEmptyQuery) {
            setValues([]);
        }

        search(newQuery);
    }

    function handleChange(newValue?: string) {
        if (onChange) {
            const v = (type === "number" && newValue ? parseFloat(newValue) : newValue) as T extends "string"
                ? string
                : number;
            onChange(v || v === 0 ? v : undefined);
        }
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
            error={!!error}
            loading={loading}
            onChange={handleChange}
            onFocus={handleFocus}
            onQueryChange={handleQueryChange}
            query={query}
            showSupportingText="always"
            suggestionMatch="disabled"
            supportingText={error ?? supportingText}
            value={value !== undefined ? `${value}` : undefined}
            values={values}
        />
    );
}) as <T extends "number" | "string", TSource = {key: string; label: string}>(
    props: AutocompleteSearchProps<T, TSource> & {ref?: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
) => ReactElement;
