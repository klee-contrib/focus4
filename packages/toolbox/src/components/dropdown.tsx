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
    useRef,
    useState
} from "react";

import {themeable} from "@focus4/core";
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

export const Dropdown = forwardRef(function Dropdown<TSource = {key: string; label: string}>(
    {
        className,
        direction = "auto",
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

    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const [focused, setFocused] = useState(false);
    const [selected, setSelected] = useState(value ?? undefinedKey);
    const onSelectedChange = useCallback(function onSelectedChange(key?: string | undefined) {
        setSelected(key ?? undefinedKey);
    }, []);

    const menu = useMenu();

    const handleKeyDown = useCallback(
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Enter" || e.key === "Space") {
                if (!menu.active) {
                    menu.open();
                }
            }
        },
        [menu.active]
    );

    useEffect(() => {
        if (focused) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [focused, handleKeyDown]);

    const handleChange = useCallback(
        (key?: string) => {
            onChange?.(key === undefinedKey ? undefined : key);
            setSelected(key ?? undefinedKey);
            setFocused(false);
            inputRef.current?.blur();
        },
        [onChange]
    );

    const handleFocus: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            setFocused(true);
            onFocus?.(event);
        },
        [onFocus]
    );

    const handleBlur: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback(
        event => {
            if (!menu.active) {
                setFocused(false);
                menu.close();
                onBlur?.(event);
            }
        },
        [menu.active, onBlur]
    );

    const selectedValue = values.find(v => getKey(v) === value);

    return (
        <div
            aria-activedescendant={id ? `${id}-${selected}` : undefined}
            className={classNames(theme.dropdown(), className)}
            data-name={name}
            data-value={value}
            id={id}
            role="listbox"
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
                theme={themeable({inputContainer: theme.input()}, theme as unknown as CSSProp<TextFieldCss>)}
                trailing={[
                    {icon: `arrow_drop_${menu.active ? "up" : "down"}`, error},
                    ...(Array.isArray(trailing) ? trailing : [trailing])
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
                position={direction === "auto" ? "full-auto" : direction === "up" ? "bottom" : "top"}
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
