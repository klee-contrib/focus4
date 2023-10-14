import classNames from "classnames";
import {orderBy, toPairs, uniqueId} from "lodash";
import {
    FocusEventHandler,
    FormEvent,
    ForwardedRef,
    forwardRef,
    KeyboardEventHandler,
    ReactElement,
    ReactEventHandler,
    ReactNode,
    SyntheticEvent,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {config} from "@focus4/core";
import {CSSProp, useTheme} from "@focus4/styling";

import {LinearProgressIndicator} from "./progress-indicator";
import {Ripple} from "./ripple";
import {TextField, TextFieldCss, TextFieldProps} from "./text-field";

import autocompleteCss, {AutocompleteCss} from "./__style__/autocomplete.css";
export {autocompleteCss, AutocompleteCss};

export interface AutocompleteProps<TSource = string>
    extends Omit<TextFieldProps, "autoComplete" | "onChange" | "theme" | "type" | "value"> {
    /** Determines if user can create a new option with the current typed value. */
    allowCreate?: boolean;
    /** Determines the opening direction. It can be auto, up or down. */
    direction?: "auto" | "down" | "up";
    /** React Node to display as the last suggestion. */
    finalSuggestion?: ReactNode;
    /** Gets the label from a source item. Defaults to returning the item (works if the item is a regular string). */
    getLabel?: (x: TSource) => string;
    /** Displays an indeteminate progress bar below the input field. */
    loading?: boolean;
    /** Custom component for rendering suggestions. */
    LineComponent?: (props: {item: TSource}) => ReactElement;
    onChange?: (value: string, event: FormEvent<HTMLInputElement | HTMLLIElement | HTMLTextAreaElement>) => void;
    /** Callback function that is fired when the components's query value changes. */
    onQueryChange?: (text: string) => void;
    /** Overrides the inner query. */
    query?: string;
    /** Object of key/values representing all items suggested. */
    source?: Record<string, TSource>;
    /** Determines how suggestions are supplied. */
    suggestionMatch?: "anywhere" | "disabled" | "start" | "word";
    /** If set, sorts the suggestions by key or label ascending. */
    suggestionSort?: "key" | "label";
    theme?: CSSProp<AutocompleteCss & TextFieldCss>;
    value?: string;
}

const defaultGetLabel = (x: any) => x;

/**
 * **_A ne pas confondre avec le composant du même nom `Autocomplete` dans le module `@focus4/forms` !_**
 *
 * Champ de saisie en autocomplétion à partir d'une **liste de valeurs possibles en entrée**.
 */
export const Autocomplete = forwardRef(function Autocomplete<TSource = string>(
    {
        allowCreate = false,
        className,
        direction: pDirection = "auto",
        disabled,
        error,
        finalSuggestion,
        getLabel = defaultGetLabel,
        hint,
        icon,
        id,
        label,
        LineComponent,
        loading = false,
        maxLength,
        multiline,
        name,
        onBlur,
        onChange,
        onContextMenu,
        onFocus,
        onKeyDown,
        onKeyPress,
        onKeyUp,
        onPaste,
        onPointerDown,
        onPointerEnter,
        onPointerLeave,
        onPointerUp,
        onQueryChange,
        prefix,
        query: pQuery,
        readOnly,
        required,
        rows,
        showSupportingText = "auto",
        supportingText,
        suffix,
        suggestionSort,
        source = {} as Record<string, TSource>,
        suggestionMatch = "start",
        tabIndex,
        trailing,
        theme: pTheme,
        value
    }: AutocompleteProps<TSource>,
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
    /** Détermine la query à partir de la valeur. */
    const getQuery = useCallback(
        (v?: string) => (v ? (source[v] && getLabel(source[v])) || v : ""),
        [getLabel, source]
    );

    const theme = useTheme("RTAutocomplete", autocompleteCss, pTheme);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const [active, setActive] = useState<string>();
    const [direction, setDirection] = useState(pDirection);
    const [focus, setFocus] = useState(false);
    const [query, setQuery] = useState(pQuery ?? getQuery(value));

    const suggestions = useMemo(() => {
        const rawQuery = (query || value) ?? "";
        const newQuery = normalise(`${rawQuery}`);

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
                    const re = new RegExp(`(?:^|\\s)${q}`, "g");
                    return re.test(v);
                default:
                    return false;
            }
        }

        if (newQuery) {
            return toPairs<TSource>(source).reduce((suggest, [k, v]) => {
                if (isMatch(normalise(getLabel(v)), newQuery)) {
                    suggest[k] = v;
                }
                return suggest;
            }, {} as Record<string, TSource>);
        } else {
            return source;
        }
    }, [getLabel, query, source, suggestionMatch, value]);

    const updateQuery = useCallback(
        (newQuery: string, notify: boolean) => {
            if (notify && onQueryChange) {
                onQueryChange(newQuery);
            }
            setQuery(newQuery);
        },
        [onQueryChange]
    );

    // Met à jour `query` quand les props changent.
    useEffect(() => {
        const q = pQuery ? pQuery : getQuery(value);
        updateQuery(q, false);
    }, [getQuery, pQuery, updateQuery, value]);

    // Recalcule la position de la sélection quand elle est automatique.
    useLayoutEffect(() => {
        if (focus && pDirection === "auto") {
            const client = inputRef.current?.getBoundingClientRect() ?? {top: 0, height: 0};
            const screenHeight = window.innerHeight || document.documentElement.offsetHeight;
            const up = client.top > screenHeight / 2 + client.height;
            setDirection(up ? "up" : "down");
        }
    }, [pDirection, focus]);

    // Appelé à la sélection d'une valeur.
    const handleChange = useCallback(
        (newValue: string, event: FormEvent<HTMLInputElement | HTMLLIElement | HTMLTextAreaElement>) => {
            const newQuery = getQuery(newValue);
            updateQuery(newQuery, !!pQuery);
            onChange?.(newValue, event);
            setFocus(false);
            inputRef.current?.blur();
        },
        [getQuery, onChange, pQuery, updateQuery]
    );

    const select = useCallback(
        (event: SyntheticEvent<HTMLInputElement | HTMLLIElement | HTMLTextAreaElement>, target: string) => {
            event.stopPropagation();
            event.preventDefault();
            handleChange(target, event);
        },
        [handleChange]
    );

    const selectOrCreateActiveItem: ReactEventHandler<HTMLInputElement | HTMLLIElement | HTMLTextAreaElement> =
        useCallback(
            event => {
                let target = active;
                if (!target) {
                    target = allowCreate ? query : Object.keys(suggestions)[0];
                    setActive(target);
                }
                select(event, target);
            },
            [active, allowCreate, query, select, suggestions]
        );

    const handleQueryChange = useCallback(
        (newQuery: string) => {
            updateQuery(newQuery, true);
            setActive(undefined);
        },
        [updateQuery]
    );

    const handleQueryFocus: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            event.target.scrollTop = 0;
            setActive("");
            setFocus(true);
            onFocus?.(event);
        },
        [onFocus]
    );

    const handleQueryKeyDown: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            if (event.key === "Enter" || event.key === "Tab") {
                selectOrCreateActiveItem(event);
            }

            onKeyDown?.(event);
        },
        [onKeyDown, selectOrCreateActiveItem]
    );

    const handleQueryKeyUp: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            if (event.key === "Escape") {
                inputRef.current?.blur();
                setFocus(false);
            }

            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                const suggestionsKeys = Object.keys(suggestions);
                let index = !active ? 0 : suggestionsKeys.indexOf(active) + (event.key === "ArrowDown" ? +1 : -1);
                if (index < 0) {
                    index = suggestionsKeys.length - 1;
                }
                if (index >= suggestionsKeys.length) {
                    index = 0;
                }
                setActive(suggestionsKeys[index]);
            }

            onKeyUp?.(event);
        },
        [active, onKeyUp, suggestions]
    );

    const [suggestionsUlId] = useState(() => uniqueId("autocomplete_suggestions"));
    const [finalSuggestionId] = useState(() => uniqueId("autocomplete_final_suggestion"));

    const onDocumentClick = useCallback(({target}: Event) => {
        let parent = target as HTMLElement | null;

        while (
            parent &&
            parent.getAttribute("data-id") !== suggestionsUlId &&
            parent.getAttribute("data-id") !== finalSuggestionId &&
            parent !== inputRef.current
        ) {
            parent = parent.parentElement;
        }

        if (!parent) {
            setFocus(false);
        } else if (parent.getAttribute("data-id") === finalSuggestionId) {
            const closeOnClick = () => {
                setFocus(false);
                window.removeEventListener("pointerup", closeOnClick);
            };
            window.addEventListener("pointerup", closeOnClick);
        }
    }, []);

    useEffect(() => {
        if (focus) {
            window.addEventListener("pointerdown", onDocumentClick);
            return () => window.removeEventListener("pointerdown", onDocumentClick);
        }
    }, [focus]);

    const suggestionList = useMemo(() => {
        const list = toPairs(suggestions).map(([key, val]) => ({key, val}));
        if (suggestionSort) {
            return orderBy(list, i => (suggestionSort === "label" ? getLabel(i.val) : i.key));
        } else {
            return list;
        }
    }, [suggestions, suggestionSort]);

    return (
        <div className={classNames(theme.autocomplete({focus}), className)} data-react-toolbox="autocomplete">
            <TextField
                ref={inputRef}
                autoComplete={config.autocompleteOffValue}
                disabled={disabled}
                error={error}
                hint={hint}
                icon={icon}
                id={id}
                label={label}
                maxLength={maxLength}
                multiline={multiline}
                name={name}
                onBlur={onBlur}
                onChange={handleQueryChange}
                onContextMenu={onContextMenu}
                onFocus={handleQueryFocus}
                onKeyDown={handleQueryKeyDown}
                onKeyPress={onKeyPress}
                onKeyUp={handleQueryKeyUp}
                onPaste={onPaste}
                onPointerDown={onPointerDown}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
                prefix={prefix}
                readOnly={readOnly}
                required={required}
                rows={rows}
                showSupportingText={showSupportingText}
                suffix={suffix}
                supportingText={supportingText}
                tabIndex={tabIndex}
                theme={theme as unknown as CSSProp<TextFieldCss>}
                trailing={trailing}
                type="search"
                value={query}
            />
            {loading ? <LinearProgressIndicator indeterminate theme={{linear: theme.progressBar()}} /> : null}
            <ul
                className={theme.suggestions({up: direction === "up", down: direction === "down"})}
                data-id={suggestionsUlId}
            >
                {suggestionList.map(({key, val}) => (
                    <Ripple key={key}>
                        <li
                            className={theme.suggestion({active: active === key})}
                            id={key}
                            onClick={selectOrCreateActiveItem}
                            onMouseOver={event => setActive(event.currentTarget.id)}
                        >
                            {LineComponent ? <LineComponent item={val} /> : getLabel(val)}
                        </li>
                    </Ripple>
                ))}
                {finalSuggestion ? (
                    <li className={theme.suggestion({final: true})} data-id={finalSuggestionId}>
                        {finalSuggestion}
                    </li>
                ) : null}
            </ul>
        </div>
    );
}) as <TSource = string>(
    props: AutocompleteProps<TSource> & {ref?: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
) => ReactElement;

function normalise(value: string) {
    const sdiak =
        "áâäąáâäąččććççĉĉďđďđééěëēėęéěëēėęĝĝğğġġģģĥĥħħíîíîĩĩīīĭĭįįi̇ıĵĵķķĸĺĺļļŀŀłłĺľĺľňńņŋŋņňńŉóöôőøōōóöőôøřřŕŕŗŗššśśŝŝşşţţťťŧŧũũūūŭŭůůűűúüúüűųųŵŵýyŷŷýyžžźźżżß";
    const bdiak =
        "AAAAAAAACCCCCCCCDDDDEEEEEEEEEEEEEGGGGGGGGHHHHIIIIIIIIIIIIIIJJKKKLLLLLLLLLLLLNNNNNNNNNOOOOOOOOOOOORRRRRRSSSSSSSSTTTTTTUUUUUUUUUUUUUUUUUWWYYYYYYZZZZZZS";

    let normalised = "";
    for (let p = 0; p < value.length; p++) {
        if (sdiak.includes(value.charAt(p))) {
            normalised += bdiak.charAt(sdiak.indexOf(value.charAt(p)));
        } else {
            normalised += value.charAt(p);
        }
    }

    return normalised.toLowerCase().trim();
}
