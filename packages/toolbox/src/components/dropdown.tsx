import classNames from "classnames";
import {
    FocusEventHandler,
    ForwardedRef,
    forwardRef,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {Menu, useMenu} from "./menu";
import {Ripple} from "./ripple";
import {TextField, TextFieldCss, TextFieldProps} from "./text-field";

import dropdownCss, {DropdownCss} from "./__style__/dropdown.css";
export {dropdownCss, DropdownCss};

export interface DropdownProps<TSource = {key: string; label: string}>
    extends Omit<TextFieldProps, "autoComplete" | "maxLength" | "onChange" | "readonly" | "theme" | "type"> {
    /** Précise dans quel sens les valeurs doivent s'afficher. Par défaut : "auto". */
    direction?: "auto" | "down" | "up";
    /** Désactive la sélection de valeurs au clavier lorsque la Dropdown est fermée. */
    disableArrowSelectionWhenClosed?: boolean;
    /**
     * Détermine la propriété de l'objet a utiliser comme clé. *
     * Par défaut : `item => item.key`
     */
    getKey?: (item: TSource) => string;
    /**
     * Détermine la propriété de l'objet à utiliser comme libellé.
     * Par défaut : `item => item.label`
     */
    getLabel?: (item: TSource) => string;
    /** Autorise la non-sélection en ajoutant une option vide. Par défaut : "true". */
    hasUndefined?: boolean;
    /** Composant personnalisé pour afficher les valeurs. */
    LineComponent?: (props: {item: TSource}) => ReactElement;
    /** Appelé avec la clé correspondante lors de la sélection d'une valeur. */
    onChange?: (value?: string) => void;
    /**
     * Contrôle la mise en forme du Dropdown :
     * - `fit-to-field-and-wrap` va forcer la largeur du menu sur la largeur du champ, et faire des retours à la ligne si nécessaire. (par défaut).
     * - `fit-to-field-single-line` force également la largeur du menu sur la largeur du champ, mais le texte sera coupé avec une ellipse au lieu de revenir à la ligne.
     * - `no-fit-single-line` laisse le champ et le menu avec leurs largeurs respectives, sans retour à la ligne.
     * - `fit-to-values` force la largeur du champ sur la largeur des valeurs, sans retour à la ligne.
     */
    sizing?: "fit-to-field-and-wrap" | "fit-to-field-single-line" | "fit-to-values" | "no-fit-single-line";
    /** CSS. */
    theme?: CSSProp<DropdownCss & TextFieldCss>;
    /** Libellé de l'option vide. */
    undefinedLabel?: ReactNode;
    /** Valeurs disponibles pour la sélection. */
    values: TSource[];
}

const defaultGetKey = (x: any) => x.key;
const defaultGetLabel = (x: any) => x.label;

const undefinedKey = "$$undefined$$";

/**
 * Un Dropdown combine un champ texte avec un menu déroulant, pour effectuer une sélection parmi une liste de valeurs disponibles.
 *
 * - Toutes les options du champ texte sont disponibles.
 * - Le rendu de chaque ligne est paramétrable.
 * - La mise en page du champ et du menu déroulant contenant les valeurs est paramétrable.
 */
export const Dropdown = forwardRef(function Dropdown<TSource = {key: string; label: string}>(
    {
        className,
        direction = "auto",
        disableArrowSelectionWhenClosed,
        disabled,
        error,
        getKey = defaultGetKey,
        getLabel = defaultGetLabel,
        hasUndefined = true,
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
        prefix,
        required,
        rows,
        sizing = "fit-to-field-and-wrap",
        showSupportingText = "auto",
        supportingText,
        suffix,
        tabIndex,
        trailing = [],
        theme: pTheme,
        undefinedLabel = "",
        value,
        values = []
    }: DropdownProps<TSource>,
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
    const theme = useTheme("dropdown", dropdownCss, pTheme);

    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const [focused, setFocused] = useState(false);
    const [selected, setSelected] = useState(value ?? undefinedKey);
    const onSelectedChange = useCallback(function onSelectedChange(key?: string | undefined) {
        setSelected(key ?? undefinedKey);
    }, []);

    const menu = useMenu();

    const handleChange = useCallback(
        (key: string, from: "click" | "keyboard") => {
            onChange?.(key === undefinedKey ? undefined : key);
            setSelected(key ?? undefinedKey);

            if (from === "click") {
                setFocused(false);
            }
        },
        [onChange]
    );

    const handleKeyDown = useCallback(
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Enter" || e.key === "Space") {
                if (!menu.active) {
                    menu.open();
                }
            } else if (
                !disableArrowSelectionWhenClosed &&
                !menu.active &&
                (e.key === "ArrowUp" || e.key === "ArrowDown")
            ) {
                e.preventDefault();
                e.stopPropagation();

                let keys = values.map(getKey);
                if (hasUndefined) {
                    keys = [undefinedKey, ...keys];
                }
                const key = value ?? undefinedKey;
                let index = keys.indexOf(key) + (e.key === "ArrowDown" ? +1 : -1);
                if (index < 0) {
                    index = keys.length - 1;
                }
                if (index >= keys.length) {
                    index = 0;
                }

                handleChange(keys[index], "keyboard");
            }
        },
        [disableArrowSelectionWhenClosed, handleChange, menu.active, value, values]
    );

    useEffect(() => {
        if (focused) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [focused, handleKeyDown]);

    const handleFocus: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            setFocused(true);
            onFocus?.(event);
        },
        [onFocus]
    );

    const handleBlur: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            if (!rootRef.current?.contains(event.relatedTarget)) {
                setFocused(false);
                menu.close();
                onBlur?.(event);
            }
        },
        [onBlur]
    );

    const [width, setWidth] = useState<number | undefined>(undefined);
    useLayoutEffect(() => {
        if (rootRef.current && sizing === "fit-to-values") {
            const ul = rootRef.current.querySelector("ul");
            if (ul) {
                setWidth(ul.clientWidth);
            }
        }
    }, [values]);

    const itemStyle = useMemo(
        () => ({
            paddingLeft: `calc(var(--text-field-${icon ? "icon-padding" : "padding-horizontal"})${
                icon ? " + var(--text-field-icon-padding) + var(--text-field-icon-size)" : ""
            })`,
            paddingRight: `calc(var(--text-field-padding-horizontal) + ${
                1 + (!trailing ? 0 : Array.isArray(trailing) ? trailing.length : 1)
            } * (var(--text-field-icon-padding) + var(--text-field-icon-size)))`
        }),
        [icon, trailing]
    );

    const selectedValue = values.find(v => getKey(v) === value);

    return (
        <div
            ref={rootRef}
            aria-activedescendant={id ? `${id}-${selected}` : undefined}
            aria-disabled={disabled}
            className={classNames(
                theme.dropdown({
                    disabled,
                    singleLine: sizing !== "fit-to-field-and-wrap"
                }),
                className
            )}
            data-name={name}
            data-value={value}
            id={id}
            role="listbox"
            style={width ? {width} : {}}
        >
            <TextField
                ref={inputRef}
                disabled={disabled}
                error={error}
                fieldRef={menu.anchor}
                hint={hint}
                icon={icon}
                label={label}
                loading={loading}
                multiline={multiline}
                onBlur={handleBlur}
                onClick={menu.toggle}
                onContextMenu={onContextMenu}
                onFocus={handleFocus}
                onKeyDown={onKeyDown}
                onKeyPress={onKeyPress}
                onKeyUp={onKeyUp}
                onPaste={onPaste}
                onPointerDown={onPointerDown}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
                onPointerUp={onPointerUp}
                prefix={prefix}
                readonly
                required={required}
                rows={rows}
                showSupportingText={showSupportingText}
                suffix={suffix}
                supportingText={supportingText}
                tabIndex={tabIndex}
                theme={theme as unknown as CSSProp<TextFieldCss>}
                trailing={[
                    {icon: `arrow_drop_${menu.active ? "up" : "down"}`, error},
                    ...(Array.isArray(trailing) ? trailing : [trailing]).map(t => ({
                        ...t,
                        blurOnClick: !!t.onClick || t.blurOnClick,
                        onClick: t.onClick
                            ? () => {
                                  t.onClick?.();
                                  setFocused(false);
                                  menu.close();
                              }
                            : undefined
                    }))
                ]}
                type="text"
                value={
                    selectedValue ? (
                        LineComponent ? (
                            <LineComponent item={selectedValue} />
                        ) : (
                            getLabel(selectedValue)
                        )
                    ) : (
                        (undefinedLabel as any)
                    )
                }
            />
            <Menu
                {...menu}
                keepItemsInDOMWhenClosed
                keepSelectionOnPointerLeave
                keepSelectionOnToggle
                noBlurOnArrowPress
                onItemClick={handleChange}
                onSelectedChange={onSelectedChange}
                position={
                    direction === "auto"
                        ? `auto-${
                              sizing === "fit-to-field-and-wrap" || sizing === "fit-to-field-single-line"
                                  ? "fill"
                                  : "left"
                          }`
                        : direction === "up"
                        ? sizing === "fit-to-field-and-wrap" || sizing === "fit-to-field-single-line"
                            ? "top"
                            : "top-left"
                        : sizing === "fit-to-field-and-wrap" || sizing === "fit-to-field-single-line"
                        ? "bottom"
                        : "bottom-left"
                }
                selected={selected}
            >
                {hasUndefined ? (
                    <Ripple key={undefinedKey}>
                        <span
                            aria-label=""
                            aria-selected={!value}
                            className={theme.value({selected: !value})}
                            id={id ? `${id}-${undefinedKey}` : undefined}
                            role="option"
                            style={itemStyle}
                        >
                            {undefinedLabel}
                        </span>
                    </Ripple>
                ) : null}
                {values.map(s => (
                    <Ripple key={getKey(s)}>
                        <span
                            aria-label={getLabel(s)}
                            aria-selected={getKey(s) === value}
                            className={theme.value({selected: getKey(s) === value})}
                            data-value={getKey(s)}
                            id={id ? `${id}-${getKey(s)}` : undefined}
                            role="option"
                            style={itemStyle}
                        >
                            {LineComponent ? <LineComponent item={s} /> : getLabel(s)}
                        </span>
                    </Ripple>
                ))}
            </Menu>
        </div>
    );
}) as <TSource = {key: string; label: string}>(
    props: DropdownProps<TSource> & {ref?: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>}
) => ReactElement;
