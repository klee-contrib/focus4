import classNames from "classnames";
import {
    FocusEvent,
    FocusEventHandler,
    ForwardedRef,
    forwardRef,
    KeyboardEventHandler,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react";

import {config} from "@focus4/core";
import {CSSProp, useTheme} from "@focus4/styling";

import {Menu, useMenu} from "./menu";
import {Ripple} from "./ripple";
import {TextField, TextFieldCss, TextFieldProps} from "./text-field";

import autocompleteCss, {AutocompleteCss} from "./__style__/autocomplete.css";
export {autocompleteCss, AutocompleteCss};

export interface AutocompleteProps<TSource = {key: string; label: string}>
    extends Omit<TextFieldProps, "autoComplete" | "maxLength" | "onChange" | "theme" | "type"> {
    /** Suggestions supplémentaires à afficher en plus des suggestions issues de `values`, pour effectuer des actions différentes.  */
    additionalSuggestions?: {key: string; content: ReactNode; onClick: () => void}[];
    /** Autorise la sélection d'une valeur qui n'existe pas dans `values` (le contenu de la `query` sera retourné en tant que valeur). */
    allowUnmatched?: boolean;
    /** Vide la query à la sélection d'une valeur. */
    clearQueryOnChange?: boolean;
    /** Précise dans quel sens les suggestions doivent s'afficher. Par défaut : "auto". */
    direction?: "auto" | "down" | "up";
    /**
     * Détermine la propriété de l'objet a utiliser comme clé. *
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
     * Appelé avec la clé correspondante lors de la sélection d'une valeur.
     *
     * Sera appelé avec `undefined` (si `allowUnmatched = false`) si aucune suggestion n'est disponible lors de la confirmation de la saisie
     * (au blur du champ ou en appuyant sur Entrée).
     */
    onChange?: (value?: string) => void;
    /** Handler appelé lorsque la query (= contenu du champ texte) change. */
    onQueryChange?: (query: string) => void;
    /** Permet de surcharger la query (= contenu du champ texte). A utiliser avec `onQueryChange`.  */
    query?: string;
    /** Précise le mode de correspondance utilisé entre la query et le libellé. Par défaut : "start". */
    suggestionMatch?: "anywhere" | "disabled" | "start" | "word";
    /** CSS. */
    theme?: CSSProp<AutocompleteCss & TextFieldCss>;
    /** Valeurs disponibles pour la sélection. */
    values?: TSource[];
}

const defaultGetKey = (x: any) => x.key;
const defaultGetLabel = (x: any) => x.label;

/**
 * Champ de saisie en autocomplétion à partir d'une **liste de valeurs possibles en entrée**.
 */
export const Autocomplete = forwardRef(function Autocomplete<TSource = {key: string; label: string}>(
    {
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
        suggestionMatch = "start",
        tabIndex,
        trailing = [],
        theme: pTheme,
        value,
        values = []
    }: AutocompleteProps<TSource>,
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
    const theme = useTheme("autocomplete", autocompleteCss, pTheme);

    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const valueRef = useRef<string | undefined>(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const menu = useMenu();
    const [selected, setSelected] = useState<string>();

    // Gestion de la `query`.
    const getQuery = useCallback(
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
    const [query, setQuery] = useState(pQuery ?? getQuery(value));
    const updateQuery = useCallback(
        (newQuery: string, notify: boolean) => {
            if (notify && onQueryChange) {
                onQueryChange(newQuery);
            }
            setQuery(newQuery);

            if (!newQuery) {
                setSelected(undefined);
            }
        },
        [onQueryChange]
    );

    useEffect(() => updateQuery(pQuery ?? getQuery(value), false), [getQuery, pQuery, updateQuery, value]);

    // Suggestions.
    const suggestions = useMemo(() => {
        const newQuery = normalise(`${query}`);

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
            return values.filter(v => isMatch(normalise(getLabel(v)), newQuery));
        } else {
            return values;
        }
    }, [getLabel, query, suggestionMatch, value, values]);

    // Détermine la valeur sélectionnée dans la liste de suggestions.
    useEffect(() => {
        if (!selected && query && suggestions.length) {
            setSelected(getKey(suggestions[0]));
        } else if (
            selected &&
            !suggestions
                .map(getKey)
                .concat(additionalSuggestions?.map(s => s.key) ?? [])
                .includes(selected)
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
                key = undefined;
            }

            updateQuery(!clearQueryOnChange ? getQuery(key) : "", pQuery !== undefined);
            onChange?.(key);
            valueRef.current = key;
            inputRef.current?.blur();
        },
        [allowUnmatched, clearQueryOnChange, getQuery, onChange, pQuery, query, suggestions, updateQuery]
    );

    // Handlers sur l'input.
    const handleQueryChange = useCallback(
        (newQuery: string) => {
            updateQuery(newQuery, true);
            valueRef.current = undefined;
        },
        [updateQuery]
    );

    const handleQueryFocus: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            event.target.scrollTop = 0;
            menu.open();
            onFocus?.(event);
        },
        [onFocus]
    );

    const handleQueryKeyDown: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            if (event.key === "Enter" || event.key === "Tab") {
                onValueChange(selected);
                menu.close();
            } else if (event.key !== "Escape") {
                menu.open();
            }

            onKeyDown?.(event);
        },
        [onKeyDown, onValueChange, selected]
    );

    const handleBlur = useCallback(
        (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if ((!valueRef.current || !selected) && !allowUnmatched && !menu.active) {
                updateQuery("", true);
                onValueChange(undefined);
            }
            onBlur?.(event);
        },
        [allowUnmatched, menu.active, onBlur, selected]
    );

    return (
        <div className={classNames(theme.autocomplete(), className)}>
            <TextField
                ref={inputRef}
                autoComplete={config.autocompleteOffValue}
                disabled={disabled}
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
                onKeyPress={onKeyPress}
                onKeyUp={onKeyUp}
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
                trailing={
                    query && !suggestions.length && !loading && !allowUnmatched
                        ? [{icon: "warning"}, ...(Array.isArray(trailing) ? trailing : [trailing])]
                        : trailing
                }
                type="search"
                value={query}
            />
            <Menu
                {...menu}
                keepSelectionOnPointerLeave
                noBlurOnArrowPress
                noRing
                onItemClick={key => onValueChange(key)}
                onSelectedChange={setSelected}
                position={direction === "auto" ? "full-auto" : direction === "up" ? "bottom" : "top"}
                selected={selected}
            >
                {suggestions.map(s => (
                    <Ripple key={getKey(s)}>
                        <span className={theme.suggestion({active: getKey(s) === selected})}>
                            {LineComponent ? <LineComponent item={s} /> : getLabel(s)}
                        </span>
                    </Ripple>
                ))}
                {additionalSuggestions?.map(({key, content}) => (
                    <Ripple key={key}>
                        <span className={theme.suggestion({active: key === selected})}>{content}</span>
                    </Ripple>
                ))}
            </Menu>
        </div>
    );
}) as <TSource = {key: string; label: string}>(
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
