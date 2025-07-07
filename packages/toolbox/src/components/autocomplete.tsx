import classNames from "classnames";
import {take} from "es-toolkit";
import {
    FocusEvent,
    FocusEventHandler,
    KeyboardEventHandler,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {CSSProp, uiConfig, useTheme} from "@focus4/styling";

import {Menu, useMenu} from "./menu";
import {Ripple} from "./ripple";
import {SupportingTextCss} from "./supporting-text";
import {TextField, TextFieldCss, TextFieldProps} from "./text-field";

import autocompleteCss, {AutocompleteCss} from "./__style__/autocomplete.css";

export {autocompleteCss};
export type {AutocompleteCss};

export interface AutocompleteProps<TSource = {key: string; label: string}>
    extends Omit<
        TextFieldProps,
        "autoComplete" | "disabled" | "maxLength" | "onChange" | "readonly" | "theme" | "type"
    > {
    /** Suggestions supplémentaires à afficher en plus des suggestions issues de `values`, pour effectuer des actions différentes.  */
    additionalSuggestions?: {key: string; content: ReactNode; onClick: () => void}[];
    /** Autorise la sélection d'une valeur qui n'existe pas dans `values` (le contenu de la `query` sera retourné en tant que valeur). */
    allowUnmatched?: boolean;
    /** Vide la query à la sélection d'une valeur. */
    clearQueryOnChange?: boolean;
    /** Précise dans quel sens les suggestions doivent s'afficher. Par défaut : "auto". */
    direction?: "auto" | "down" | "up";
    /** Désactive l'Autocomplete (si true), ou une liste d'options de l'Autocomplete (si liste de string). */
    disabled?: boolean | string[];
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
    /** Composant personnalisé pour afficher les suggestions. */
    LineComponent?: (props: {item: TSource}) => ReactElement;
    /**
     * Nombre maximal de suggestions affichées. Passer `0` ou `undefined` permet de désactiver cette limitation (à vos risques et périls).
     *
     * Par défaut : 50.
     */
    maxDisplayed?: number;
    /** Ne ferme pas le menu de l'Autocomplete lors de la sélection d'un item. */
    noCloseOnChange?: boolean;
    /**
     * Appelé avec la clé correspondante lors de la sélection d'une valeur.
     *
     * Sera appelé avec `undefined` (si `allowUnmatched = false`) si aucune suggestion n'est disponible lors de la confirmation de la saisie
     * (au blur du champ ou en appuyant sur Entrée).
     */
    onChange?: (key?: string, value?: TSource) => void;
    /** Handler appelé lorsque la query (= contenu du champ texte) change. A utiliser avec `query`. */
    onQueryChange?: (query: string) => void;
    /** N'affiche pas les suggestions si le champ est vide. */
    noSuggestionsOnEmptyQuery?: boolean;
    /** Permet de surcharger la query (= contenu du champ texte). A utiliser avec `onQueryChange`.  */
    query?: string;
    /**
     * Contrôle la mise en forme des suggestions :
     * - `fit-to-field-single-line` force la largeur du menu à celle du champ (par défaut).
     * - `no-fit-single-line` laisse la largeur du menu se calculer en fonction de la taille de ses éléments.
     */
    sizing?: "fit-to-field-single-line" | "no-fit-single-line";
    /** Précise le mode de correspondance utilisé entre la query et le libellé. Par défaut : "start". */
    suggestionMatch?: "anywhere" | "disabled" | "start" | "word";
    /** CSS. */
    theme?: CSSProp<AutocompleteCss & TextFieldCss & SupportingTextCss>;
    /** Valeurs disponibles pour la sélection. */
    values: TSource[];
}

const defaultGetKey = (x: any) => x.key;
const defaultGetLabel = (x: any) => x.label;

/**
 * Un Autocomplete combine un champ texte ([`TextField`](/docs/composants-focus4∕toolbox-textfield--docs)) en autocomplétion avec un menu déroulant ([`Menu`](/docs/composants-focus4∕toolbox-menu--docs)), pour effectuer une sélection à partir d'une **liste de valeurs pré-chargée**.
 *
 * - Le filtrage des valeurs s'effecue dans le composant selon plusieurs modes de correspondance.
 * - Toutes les options du champ texte sont disponibles.
 * - Peut être utilisé comme un champ de recherche rapide.
 * - Peut afficher des suggestions complémentaires.
 *
 * L'`Autocomplete` peut également être utilisé dans un mode alternatif pour **fournir des suggestions sur un champ de saisie libre**. Pour cet usage, il faut utiliser `allowUnmatched`, avec `query` et `onQueryChange` à la place de `value` et de `onChange` (`onChange` peut néanmoints toujours être utilisé lorsqu'on sélectionne une valeur existante).
 */
export function Autocomplete<TSource = {key: string; label: string}>({
    additionalSuggestions,
    allowUnmatched = false,
    className,
    clearQueryOnChange,
    direction = "auto",
    disabled,
    error,
    getKey = defaultGetKey,
    getLabel = defaultGetLabel,
    hint,
    icon,
    id,
    label,
    LineComponent,
    loading = false,
    maxDisplayed = 50,
    multiline,
    name,
    noCloseOnChange,
    onBlur,
    onChange,
    onContextMenu,
    onFocus,
    onKeyDown,
    onKeyUp,
    onPaste,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    onQueryChange,
    noSuggestionsOnEmptyQuery = false,
    prefix,
    required,
    ref,
    query: pQuery,
    rows,
    showSupportingText = "auto",
    sizing = "fit-to-field-single-line",
    supportingText,
    suffix,
    suggestionMatch = "start",
    tabIndex,
    trailing = [],
    theme: pTheme,
    value,
    values = []
}: AutocompleteProps<TSource>) {
    const theme = useTheme("autocomplete", autocompleteCss, pTheme);

    const valueRef = useRef<string | undefined>(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const menu = useMenu();
    const [selected, setSelected] = useState<string>();

    // Gestion de la `query`.
    const getQueryFromValue = useCallback(
        (v?: string) => {
            if (v) {
                const match = values.find(i => getKey(i) === v);
                if (match) {
                    return getLabel(match);
                }
            }

            return v ?? "";
        },
        [getKey, getLabel, values]
    );

    const [sQuery, setSQuery] = useState(() => getQueryFromValue(value));
    useEffect(() => {
        const newQuery = getQueryFromValue(value);
        setSQuery(newQuery);
        if (!newQuery) {
            setSelected(undefined);
        }
    }, [getQueryFromValue, value]);

    const query = pQuery ?? sQuery;
    const setQuery = useCallback(
        (newQuery: string) => {
            if (pQuery !== undefined && onQueryChange) {
                onQueryChange(newQuery);
            } else {
                setSQuery(newQuery);
            }

            if (!newQuery) {
                setSelected(undefined);
            }
        },
        [onQueryChange]
    );

    // Suggestions.
    const suggestions = useMemo(() => {
        const newQuery = normalize(query);

        /** Détermine si la valeur est une match pour la requête.  */
        function isMatch(v: string, q: string) {
            switch (suggestionMatch) {
                case "disabled":
                    return true;
                case "start":
                    return v.startsWith(q);
                case "anywhere":
                    return v.includes(q);
                case "word":
                    return new RegExp(`(?:^|\\s)${q}`, "g").test(v);
                default:
                    return false;
            }
        }

        if (newQuery) {
            return values.filter(v => isMatch(normalize(getLabel(v)), newQuery));
        } else if (noSuggestionsOnEmptyQuery) {
            return [];
        } else {
            return values;
        }
    }, [getLabel, noSuggestionsOnEmptyQuery, query, suggestionMatch, value, values]);

    // Détermine la valeur sélectionnée dans la liste de suggestions.
    useEffect(() => {
        if (!selected && query && suggestions.length) {
            setSelected(getKey(suggestions[0]));
        } else if (
            selected &&
            ![...suggestions.map(getKey), ...(additionalSuggestions?.map(s => s.key) ?? [])].includes(selected)
        ) {
            setSelected(undefined);
        }
    }, [getKey, query, selected, suggestions]);

    // Appelé à la sélection d'une valeur.
    const onValueChange = useCallback(
        (key?: string) => {
            if (!key && allowUnmatched) {
                key = query;
            }

            const additionalSuggestion = additionalSuggestions?.find(s => s.key === key);
            if (additionalSuggestion) {
                additionalSuggestion.onClick();
                return;
            }

            setQuery(!clearQueryOnChange ? getQueryFromValue(key) : "");
            onChange?.(
                key,
                values.find(v => getKey(v) === key)
            );
            valueRef.current = key;
        },
        [allowUnmatched, clearQueryOnChange, getQueryFromValue, onChange, query, suggestions, setQuery, values]
    );

    // Handlers sur l'input.
    const handleQueryChange = useCallback(
        (newQuery: string) => {
            setQuery(newQuery);
            valueRef.current = undefined;
        },
        [setQuery]
    );

    const handleQueryFocus: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            menu.open();
            onFocus?.(event);
        },
        [onFocus]
    );

    const handleQueryKeyDown: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            if (event.key === "Enter") {
                event.preventDefault();
            }

            if ((event.key === "Enter" && !!(query || selected)) || event.key === "Tab") {
                event.stopPropagation();
                onValueChange(selected);
                menu.close();
            } else if (event.key !== "Escape") {
                menu.open();
            }

            onKeyDown?.(event);
        },
        [onKeyDown, onValueChange, query, selected]
    );

    const handleBlur = useCallback(
        (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if ((!valueRef.current || !selected) && !allowUnmatched && !menu.active) {
                setQuery("");
                onValueChange(undefined);
            }
            onBlur?.(event);
        },
        [allowUnmatched, menu.active, onBlur, selected, setQuery]
    );

    return (
        <div className={classNames(theme.autocomplete({singleLine: sizing === "no-fit-single-line"}), className)}>
            <TextField
                ref={ref}
                aria-activedescendant={id ? `${id}-${selected}` : undefined}
                aria-autocomplete="list"
                aria-controls={id ? `${id}-suggestions` : undefined}
                aria-expanded={menu.active}
                autoComplete={uiConfig.autocompleteOffValue}
                disabled={disabled === true}
                error={error}
                fieldRef={menu.anchor}
                hint={hint}
                icon={icon}
                id={id}
                label={label}
                loading={loading}
                multiline={multiline}
                name={name}
                onBlur={handleBlur}
                onChange={handleQueryChange}
                onContextMenu={onContextMenu}
                onFocus={handleQueryFocus}
                onKeyDown={handleQueryKeyDown}
                onKeyUp={onKeyUp}
                onPaste={onPaste}
                onPointerDown={onPointerDown}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
                prefix={prefix}
                required={required}
                role="combobox"
                rows={rows}
                showSupportingText={showSupportingText}
                suffix={suffix}
                supportingText={supportingText}
                tabIndex={tabIndex}
                theme={theme as unknown as CSSProp<TextFieldCss>}
                trailing={
                    query && !suggestions.length && !loading && !allowUnmatched
                        ? [{icon: "warning"}, ...(Array.isArray(trailing) ? trailing : [trailing])]
                        : trailing
                }
                type="search"
                value={query}
            />
            <Menu
                id={`${id}-suggestions`}
                role="listbox"
                {...menu}
                keepSelectionOnPointerLeave
                keepSelectionOnToggle
                noBlurOnArrowPress
                noCloseOnClick={noCloseOnChange}
                noRing
                onItemClick={key => onValueChange(key)}
                onSelectedChange={setSelected}
                position={
                    direction === "auto"
                        ? `auto-${sizing === "no-fit-single-line" ? "left" : "fill"}`
                        : direction === "up"
                          ? sizing === "no-fit-single-line"
                              ? "top-left"
                              : "top"
                          : sizing === "no-fit-single-line"
                            ? "bottom-left"
                            : "bottom"
                }
                selected={selected}
            >
                {(maxDisplayed ? take(suggestions, maxDisplayed) : suggestions).map(s => (
                    <Ripple key={getKey(s)} disabled={Array.isArray(disabled) && disabled.includes(getKey(s))}>
                        <span
                            aria-label={getLabel(s)}
                            aria-selected={getKey(s) === selected}
                            className={theme.suggestion({
                                active: getKey(s) === selected,
                                disabled: Array.isArray(disabled) && disabled.includes(getKey(s))
                            })}
                            id={id ? `${id}-${getKey(s)}` : undefined}
                            role="option"
                        >
                            {LineComponent ? <LineComponent item={s} /> : getLabel(s)}
                        </span>
                    </Ripple>
                ))}
                {additionalSuggestions?.map(({key, content}) => (
                    <Ripple key={key} disabled={Array.isArray(disabled) && disabled.includes(key)}>
                        <span
                            aria-selected={key === selected}
                            className={theme.suggestion({
                                active: key === selected,
                                disabled: Array.isArray(disabled) && disabled.includes(key)
                            })}
                            id={id ? `${id}-${key}` : undefined}
                            role="option"
                        >
                            {content}
                        </span>
                    </Ripple>
                ))}
            </Menu>
        </div>
    );
}

function normalize(value: string) {
    return value
        .normalize("NFD")
        .replaceAll(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();
}
