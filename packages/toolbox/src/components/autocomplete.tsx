import classNames from "classnames";
import {orderBy, toPairs, uniqueId} from "lodash";
import {
    FocusEventHandler,
    FormEvent,
    ForwardedRef,
    forwardRef,
    KeyboardEvent,
    KeyboardEventHandler,
    ReactElement,
    ReactEventHandler,
    ReactNode,
    SyntheticEvent,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react";

import {config} from "@focus4/core";
import {CSSProp, useTheme} from "@focus4/styling";

import {Chip} from "./chip";
import {Input, InputCss, InputProps} from "./input";
import {ProgressBar} from "./progress-bar";
import {Ripple} from "./ripple";

import autocompleteCss, {AutocompleteCss} from "./__style__/autocomplete.css";
export {autocompleteCss, AutocompleteCss};

export interface AutocompleteProps<TValue extends string[] | string = string, TSource = string>
    extends Omit<InputProps, "autoComplete" | "onChange" | "theme" | "type" | "value"> {
    /** Determines if user can create a new option with the current typed value. */
    allowCreate?: boolean;
    /** Determines the opening direction. It can be auto, up or down. */
    direction?: "auto" | "down" | "up";
    /** Whether component should keep focus after value change. */
    keepFocusOnChange?: boolean;
    /** React Node to display as the last suggestion. */
    finalSuggestion?: ReactNode;
    /** Gets the label from a source item. Defaults to returning the item (works if the item is a regular string). */
    getLabel?: (x: TSource) => string;
    /** Displays an indeteminate progress bar below the input field. */
    loading?: boolean;
    /** Custom component for rendering suggestions. */
    LineComponent?: (props: {item: TSource}) => ReactElement;
    /** If true, component can hold multiple values. */
    multiple?: TValue extends string[] ? true : false;
    onChange?: (value: TValue, event: FormEvent<HTMLInputElement | HTMLLIElement | HTMLTextAreaElement>) => void;
    /** Callback function that is fired when the components's query value changes. */
    onQueryChange?: (text: string) => void;
    /** Overrides the inner query. */
    query?: string;
    /** If set to false, disable the rippling effect on suggestions. */
    ripple?: boolean;
    /** Determines if the selected list is shown above or below input. It can be above or below. */
    selectedPosition?: "above" | "below" | "none";
    /** If true, the list of suggestions will not be filtered when a value is selected. */
    showSuggestionsWhenValueIsSet?: boolean;
    /** Object of key/values representing all items suggested. */
    source?: Record<string, TSource>;
    /** Determines how suggestions are supplied. */
    suggestionMatch?: "anywhere" | "disabled" | "start" | "word";
    /** If set, sorts the suggestions by key or label ascending. */
    suggestionSort?: "key" | "label";
    theme?: CSSProp<AutocompleteCss & InputCss>;
    value?: TValue;
}

const defaultGetLabel = (x: any) => x;

/**
 * **_A ne pas confondre avec le composant du même nom `Autocomplete` dans le module `@focus4/forms` !_**
 *
 * Champ de saisie en autocomplétion à partir d'une **liste de valeurs possibles en entrée**.
 */
export const Autocomplete = forwardRef(function RTAutocomplete<
    TValue extends string[] | string = string,
    TSource = string
>(
    {
        allowCreate = false,
        className,
        children,
        direction: pDirection = "auto",
        disabled,
        error,
        finalSuggestion,
        floating,
        getLabel = defaultGetLabel,
        hint,
        icon,
        id,
        keepFocusOnChange = false,
        label,
        LineComponent,
        loading = false,
        maxLength,
        multiline,
        multiple = true as any,
        name,
        onBlur,
        onChange,
        onClick,
        onContextMenu,
        onDoubleClick,
        onFocus,
        onKeyDown,
        onKeyPress,
        onKeyUp,
        onMouseDown,
        onMouseEnter,
        onMouseLeave,
        onMouseMove,
        onMouseOut,
        onMouseOver,
        onMouseUp,
        onPaste,
        onPointerDown,
        onPointerEnter,
        onPointerLeave,
        onPointerUp,
        onQueryChange,
        query: pQuery,
        required,
        ripple = true,
        rows,
        selectedPosition = "above",
        showSuggestionsWhenValueIsSet = false,
        suggestionSort,
        source = {},
        suggestionMatch = "start",
        style,
        theme: pTheme,
        value
    }: AutocompleteProps<TValue, TSource>,
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
    /** Détermine la query à partir de la valeur. */
    const getQuery = useCallback(
        (v?: string[] | string) =>
            !multiple && v ? (source[v as string] && getLabel(source[v as string])) || (v as string) : "",
        [getLabel, multiple, source]
    );

    const theme = useTheme("RTAutocomplete", autocompleteCss, pTheme);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const [active, setActive] = useState<string | null>();
    const [direction, setDirection] = useState(pDirection);
    const [focus, setFocus] = useState(false);
    const [showAllSuggestions, setShowAllSuggestions] = useState(showSuggestionsWhenValueIsSet);
    const [query, setQuery] = useState(pQuery ?? getQuery(value));

    const values = useMemo(() => {
        let vals = multiple ? (value as string[]) : [value as string];
        if (!vals) {
            vals = [];
        }

        const res: Record<string, TSource> = {};
        Object.keys(source).forEach(key => {
            if (vals.includes(key)) {
                res[key] = source[key];
            }
        });

        return res;
    }, [multiple, source, value]);

    const suggestions = useMemo(() => {
        let suggest: Record<string, TSource> = {};
        const rawQuery = (query || (multiple ? "" : value)) as string;
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

        if (multiple) {
            // Suggest any non-set value which matches the query
            Object.keys(source).forEach(key => {
                if (!values[key] && isMatch(normalise(getLabel(source[key])), newQuery)) {
                    suggest[key] = source[key];
                }
            });
        } else if (newQuery && !showAllSuggestions) {
            // When multiple is false, suggest any value which matches the query if showAllSuggestions is false
            Object.keys(source).forEach(key => {
                if (isMatch(normalise(getLabel(source[key])), newQuery)) {
                    suggest[key] = source[key];
                }
            });
        } else {
            // When multiple is false, suggest all values when showAllSuggestions is true
            suggest = source;
        }

        return suggest;
    }, [getLabel, multiple, query, source, showAllSuggestions, suggestionMatch, value, values]);

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
        if (!multiple) {
            const q = pQuery ? pQuery : getQuery(value);
            updateQuery(q, false);
        }
    }, [getQuery, multiple, pQuery, updateQuery, value]);

    // Recalcule la position de la sélection quand elle est automatique.
    useEffect(() => {
        if (focus && pDirection === "auto") {
            const client = inputRef.current?.getBoundingClientRect() ?? {top: 0, height: 0};
            const screenHeight = window.innerHeight || document.documentElement.offsetHeight;
            const up = client.top > screenHeight / 2 + client.height;
            setDirection(up ? "up" : "down");
        }
    }, [pDirection, focus]);

    // Appelé à la sélection d'une valeur.
    const handleChange = useCallback(
        (vals: string[], event: FormEvent<HTMLInputElement | HTMLLIElement | HTMLTextAreaElement>) => {
            const newValue = (multiple ? vals : vals[0]) as TValue;
            const newQuery = getQuery(newValue);
            updateQuery(newQuery, !!pQuery);
            onChange?.(newValue, event);
            setShowAllSuggestions(showSuggestionsWhenValueIsSet);
            if (!keepFocusOnChange) {
                setFocus(false);
                inputRef.current?.blur();
            }
        },
        [getQuery, keepFocusOnChange, multiple, onChange, pQuery, showSuggestionsWhenValueIsSet, updateQuery]
    );

    const select = useCallback(
        (event: SyntheticEvent<HTMLInputElement | HTMLLIElement | HTMLTextAreaElement>, target: string) => {
            event.stopPropagation();
            event.preventDefault();
            handleChange([target, ...Object.keys(values)], event);
        },
        [handleChange, values]
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

    const unselect = useCallback(
        (key: string, event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (!disabled) {
                handleChange(
                    Object.keys(values).filter(k => k !== key),
                    event
                );
            }
        },
        [disabled, handleChange, values]
    );

    const clearQuery = useRef<boolean>(false);

    const handleQueryChange = useCallback(
        (newValue: string) => {
            const newQuery = clearQuery.current ? "" : newValue;
            clearQuery.current = false;
            updateQuery(newQuery, true);
            setShowAllSuggestions(newQuery ? false : showSuggestionsWhenValueIsSet);
            setActive(null);
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
            // Mark query for clearing in handleQueryChange when pressing backspace and showing all suggestions.
            clearQuery.current = event.key === "Backspace" && showSuggestionsWhenValueIsSet && showAllSuggestions;

            if (event.key === "Enter" || event.key === "Tab") {
                selectOrCreateActiveItem(event);
            }

            onKeyDown?.(event);
        },
        [onKeyDown, selectOrCreateActiveItem, showSuggestionsWhenValueIsSet, showAllSuggestions]
    );

    const handleQueryKeyUp: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            if (event.key === "Escape") {
                inputRef.current?.blur();
                setFocus(false);
            }

            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                const suggestionsKeys = Object.keys(suggestions);
                let index = suggestionsKeys.indexOf(active!) + (event.key === "ArrowDown" ? +1 : -1);
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
                window.removeEventListener("mouseup", closeOnClick);
            };
            window.addEventListener("mouseup", closeOnClick);
        }
    }, []);

    useEffect(() => {
        if (focus) {
            window.addEventListener("mousedown", onDocumentClick);
            return () => window.removeEventListener("mousedown", onDocumentClick);
        }
    }, [focus]);

    const renderSelected = useCallback(() => {
        if (multiple) {
            const selectedItems = toPairs(suggestions).map(([key, val]) => (
                <Chip key={key} className={theme.value()} deletable onDeleteClick={(e: any) => unselect(key, e)}>
                    {getLabel(val)}
                </Chip>
            ));

            return <ul className={theme.values()}>{selectedItems}</ul>;
        }
    }, [getLabel, multiple, unselect, theme, values]);

    const suggestionList = useMemo(() => {
        const list = toPairs(suggestions).map(([key, val]) => ({key, val}));
        if (suggestionSort) {
            return orderBy(list, suggestionSort === "label" ? "val" : suggestionSort);
        } else {
            return list;
        }
    }, [suggestions, suggestionSort]);

    const RipplingLi = useMemo(
        () =>
            (ripple
                ? props => (
                      <Ripple>
                          <li {...props} />
                      </Ripple>
                  )
                : props => <li {...props} />) as (
                props: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>
            ) => ReactElement,
        [ripple, theme]
    );

    return (
        <div className={classNames(theme.autocomplete({focus}), className)} data-react-toolbox="autocomplete">
            {selectedPosition === "above" ? renderSelected() : null}
            <Input
                ref={inputRef}
                autoComplete={config.autocompleteOffValue}
                className={theme.input()}
                disabled={disabled}
                error={error}
                floating={floating}
                hint={hint}
                icon={icon}
                id={id}
                label={label}
                maxLength={maxLength}
                multiline={multiline}
                name={name}
                onBlur={onBlur}
                onChange={handleQueryChange}
                onClick={onClick}
                onContextMenu={onContextMenu}
                onDoubleClick={onDoubleClick}
                onFocus={handleQueryFocus}
                onKeyDown={handleQueryKeyDown}
                onKeyPress={onKeyPress}
                onKeyUp={handleQueryKeyUp}
                onMouseDown={onMouseDown}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onMouseMove={onMouseMove}
                onMouseOut={onMouseOut}
                onMouseOver={onMouseOver}
                onMouseUp={onMouseUp}
                onPaste={onPaste}
                onPointerDown={onPointerDown}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
                required={required}
                rows={rows}
                style={style}
                theme={theme as unknown as CSSProp<InputCss>}
                type="search"
                value={query}
            >
                {children}
            </Input>
            {loading ? (
                <ProgressBar mode="indeterminate" theme={{progressBar: theme.progressBar()}} type="linear" />
            ) : null}
            <ul
                className={theme.suggestions({up: direction === "up", down: direction === "down"})}
                data-id={suggestionsUlId}
            >
                {suggestionList.map(({key, val}) => (
                    <RipplingLi
                        key={key}
                        className={theme.suggestion({active: active === key})}
                        id={key}
                        onClick={selectOrCreateActiveItem}
                        onMouseOver={event => setActive(event.currentTarget.id)}
                    >
                        {LineComponent ? <LineComponent item={val} /> : getLabel(val)}
                    </RipplingLi>
                ))}
                {finalSuggestion ? (
                    <li className={theme.suggestion({final: true})} data-id={finalSuggestionId}>
                        {finalSuggestion}
                    </li>
                ) : null}
            </ul>
            {selectedPosition === "below" ? renderSelected() : null}
        </div>
    );
}) as <TValue extends string[] | string = string, TSource = string>(
    props: AutocompleteProps<TValue, TSource> & {ref?: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
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
