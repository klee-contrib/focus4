import {debounce} from "es-toolkit";
import {useObserver} from "mobx-react";
import {useCallback, useEffect, useId, useRef, useState} from "react";

import {isAbortError, requestStore} from "@focus4/core";
import {stringToDomainType} from "@focus4/forms";
import {DomainFieldTypeSingle, DomainType} from "@focus4/stores";
import {Autocomplete, AutocompleteProps} from "@focus4/toolbox";

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
    querySearcher?: (text: string, options?: RequestInit) => Promise<TSource[]>;
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
export function AutocompleteSearch<const T extends DomainFieldTypeSingle, TSource = {key: string; label: string}>({
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
}: AutocompleteSearchProps<T, TSource>) {
    const [query, setQuery] = useState(pQuery);
    useEffect(() => setQuery(pQuery), [pQuery]);

    const trackingId = useId();
    const [values, setValues] = useState<TSource[]>([]);

    useEffect(() => {
        if ((!!value || value === 0) && (!!keyResolver || !!pQuery)) {
            requestStore.track(trackingId, () =>
                (keyResolver
                    ? keyResolver(value)
                    : new Promise<string>(r => {
                          r(pQuery);
                      })
                ).then(async label => {
                    setQuery(label ?? `${value}`);
                    if (!values.find(v => getKey(v) === value) && label && querySearcher) {
                        setValues(await querySearcher(label));
                    }
                })
            );
        }
    }, [value]);

    const abortController = useRef<AbortController>(undefined);
    const search = useCallback(
        debounce(async function search(newQuery: string) {
            if (querySearcher && (searchOnEmptyQuery || newQuery.trim().length)) {
                try {
                    abortController.current?.abort();
                    abortController.current = new AbortController();
                    const {signal} = abortController.current;

                    setValues(await requestStore.track(trackingId, () => querySearcher(newQuery.trim(), {signal})));

                    abortController.current = undefined;
                } catch (e: unknown) {
                    if (isAbortError(e)) {
                        return;
                    }
                }
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

    return useObserver(() => (
        <Autocomplete
            {...props}
            disabled={Array.isArray(disabled) ? disabled.map(v => `${v}`) : disabled}
            error={!!error}
            getKey={getKey}
            loading={requestStore.isLoading(trackingId)}
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
    ));
}
