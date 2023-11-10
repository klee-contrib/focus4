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

    const handleChange = useCallback(
        (key?: string) => {
            onChange?.(key === undefinedKey ? undefined : key);
            setSelected(key ?? undefinedKey);
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

                handleChange(keys[index]);
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
            aria-disabled={disabled}
            className={classNames(theme.dropdown({disabled}), className)}
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
                theme={theme as unknown as CSSProp<TextFieldCss>}
                trailing={[
                    {icon: `arrow_drop_${menu.active ? "up" : "down"}`, error},
                    ...(Array.isArray(trailing) ? trailing : [trailing]).map(t => ({
                        ...t,
                        onClick: t.blurOnClick
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
                position={direction === "auto" ? "auto-fill" : direction === "up" ? "top" : "bottom"}
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
