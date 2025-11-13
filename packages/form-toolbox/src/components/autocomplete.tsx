import {debounce} from "es-toolkit";
import {useObserver} from "mobx-react";
import {FocusEvent, useCallback, useEffect, useId, useRef, useState} from "react";
import {output} from "zod";

import {isAbortError, requestStore} from "@focus4/core";
import {stringToSchemaOutput, ZodTypeSingle} from "@focus4/entities";
import {Autocomplete, AutocompleteProps} from "@focus4/toolbox";

export interface AutocompleteSearchProps<S extends ZodTypeSingle, TSource = {key: string; label: string}>
    extends Omit<
        AutocompleteProps<TSource>,
        | "disabled"
        | "error"
        | "label"
        | "loading"
        | "noSuggestionsOnEmptyQuery"
        | "onChange"
        | "suggestionMatch"
        | "value"
        | "values"
    > {
    /** Désactive l'Autocomplete (si true), ou une liste d'options de l'Autocomplete (si liste de valeurs). */
    disabled?: boolean | output<S>[];
    /** Erreur à afficher sous le champ. */
    error?: string;
    /** Service de résolution de clé. Doit retourner le libellé. */
    keyResolver?: (key: output<S>) => Promise<string | undefined>;
    /**
     * Appelé à la sélection d'une valeur.
     *
     * En plus de passer la valeur choisie comme tout composant de saisie, le composant envoie aussi en second paramètre l'objet source entier qui correspond à cette valeur.
     * Même si la signature de `onChange` de `autocompleteFor` ne vous le dit pas, vous pouvez quand même la récupérer par ici dans votre composant.
     */
    onChange: (key: output<S> | undefined, value?: TSource) => void;
    /** Service de recherche. */
    querySearcher?: (text: string, options?: RequestInit) => Promise<TSource[]>;
    /** Schéma du champ (celui du domaine). */
    schema: S;
    /** Délai (en ms) entre la fin de la saisie de l'utilisateur et le lancement de la recherche. Par défaut : 500.  */
    searchDelay?: number;
    /** Active l'appel à la recherche si le champ est vide. */
    searchOnEmptyQuery?: boolean;
    /** Rappelle la recherche quand le `querySearcher` change (nécessite un `querySearcher` stable). */
    searchOnQuerySearcherChange?: boolean;
    /** Valeur. */
    value?: output<S>;
}

const defaultGetKey = (x: any) => x.key;

/**
 * Un [`Autocomplete`](/docs/composants-focus4∕toolbox-autocomplete--docs) qui récupère ses suggestions à partir **d'un service de recherche** au lieu d'une liste pré-chargée.
 * Aucun filtre supplémentaire ne sera réalisé dans le composant.
 *
 * Il s'agit du [composant par défaut de tous les domaines de type `string`, `number` et `boolean`](/docs/docs/composants-composants-par-défaut--docs) pour [`autocompleteFor`](/docs/modèle-métier-afficher-des-champs--docs#autocompleteforfield-options) (`AutocompleteComponent`).
 *
 * L'`AutocompleteSearch` peut également être utilisé dans un mode alternatif pour **fournir des suggestions sur un champ de saisie libre**. Pour cet usage, il faut utiliser `allowUnmatched`, avec `query` et `onQueryChange` à la place de `value` et de `onChange` (`onChange` peut néanmoints toujours être utilisé lorsqu'on sélectionne une valeur existante). **Il doit être utilisé comme un `InputComponent` pour cet usage.**
 *
 * Exemple :
 * ```tsx
 * .patch("champ", f => f.metadata({
 *     InputComponent: ({value, onChange, ...props}) =>
 *         <AutocompleteSearch
 *             {...props}
 *             allowUnmatched
 *             querySearcher={querySearcher}
 *             query={value}
 *             onQueryChange={onChange}
 *         />
 *     }))
 * ```
 */
export function AutocompleteSearch<const S extends ZodTypeSingle, TSource = {key: string; label: string}>({
    disabled,
    error,
    getKey = defaultGetKey,
    keyResolver,
    onChange,
    onFocus,
    onQueryChange,
    query: pQuery = "",
    querySearcher,
    schema,
    searchDelay = 500,
    searchOnEmptyQuery = false,
    searchOnQuerySearcherChange = false,
    supportingText,
    showSupportingText = "always",
    value,
    ...props
}: AutocompleteSearchProps<S, TSource>) {
    const [query, setQuery] = useState(pQuery);
    useEffect(() => setQuery(pQuery), [pQuery]);

    const trackingId = useId();
    const [values, setValues] = useState<TSource[]>([]);

    useEffect(() => {
        if ((!!value || value === 0) && (!!keyResolver || !!pQuery)) {
            requestStore.track(
                trackingId,
                () =>
                    keyResolver
                        ? keyResolver(value)
                        : new Promise<string>(r => {
                              r(pQuery);
                          }),
                async label => {
                    setQuery(label ?? `${value}`);
                    if (!values.some(v => getKey(v) === value) && label && querySearcher) {
                        setValues(await querySearcher(label));
                    }
                }
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
                } catch (error) {
                    if (isAbortError(error)) {
                        return;
                    }
                }
            }
        }, searchDelay),
        [querySearcher, searchDelay, searchOnEmptyQuery]
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
        onChange?.(stringToSchemaOutput(newKey, schema), newValue);
    }

    function handleFocus(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
        if (searchOnEmptyQuery && !values.length) {
            search(query);
        }

        onFocus?.(e);
    }

    return useObserver(() => (
        <Autocomplete
            {...props}
            disabled={Array.isArray(disabled) ? disabled.map(v => `${v}`) : disabled}
            error={!!error}
            getKey={getKey}
            label={undefined}
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
