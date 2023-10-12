import classNames from "classnames";
import {
    ChangeEvent,
    ClipboardEventHandler,
    FocusEvent,
    FocusEventHandler,
    FormEvent,
    ForwardedRef,
    forwardRef,
    KeyboardEventHandler,
    MouseEvent,
    MouseEventHandler,
    ReactNode,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

import {FontIcon} from "./font-icon";
import {IconButton} from "./icon-button";
import {Tooltip} from "./tooltip";

import textFieldCss, {TextFieldCss} from "./__style__/text-field.css";
export {textFieldCss, TextFieldCss};

const CUT_START = 12;

/** Définition des icônes de fin de champ texte. */
interface TrailingIcon {
    /** Affiche l'icône en erreur. */
    error?: boolean;
    /** Icône. */
    icon: ReactNode;
    /** Handler de clic sur l'icône (pose un bouton icône si renseigné au lieu d'une icône simple.) */
    onClick?: () => void;
    /** Tooltip pour l'icône. */
    tooltip?: ReactNode;
}

/** Props du champ texte.  */
export interface TextFieldProps extends PointerEvents<HTMLInputElement | HTMLTextAreaElement> {
    /** Valeur de `autocomplete` sur l'input HTML. */
    autoComplete?: string;
    /** Classe CSS pour le composant racine. */
    className?: string;
    /** Désactive le champ texte. */
    disabled?: boolean;
    /** Affiche le champ texte en erreur. */
    error?: boolean;
    /** Placeholder pour le champ texte. */
    hint?: string;
    /** Icône à poser devant le texte. */
    icon?: ReactNode;
    /** `id` pour l'input HTML. */
    id?: string;
    /** Libellé du champ, sera affiché à la place du `hint` et se déplacera sur le dessus lorsque le champ est utilisé. */
    label?: string;
    /** Taille maximum du champ. Sera affiché en dessous du champ à côté de `supportingText`. */
    maxLength?: number;
    /** Si renseigné, affiche un <textarea> à la place de l'<input>.  */
    multiline?: boolean;
    /** `name` pour l'input HTML. */
    name?: string;
    /** Au blur du champ texte. */
    onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    /** Handler appelé à chaque modification du texte dans le champ. */
    onChange?: (value: string, event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    /** Au clic sur le champ texte. */
    onClick?: MouseEventHandler<HTMLDivElement>;
    /** Au clic-droit dans le champ texte. */
    onContextMenu?: MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    /** Au focus du champ texte. */
    onFocus?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    /** Au `keydown` du champ. */
    onKeyDown?: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    /** Au `keypress` du champ. */
    onKeyPress?: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    /** Au `keyup` du champ. */
    onKeyUp?: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    /** Au collage de texte dans le champ. */
    onPaste?: ClipboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    /** Préfixe à poser devant le texte. */
    prefix?: string;
    /** Valeur de `readonly` sur l'input HTML. */
    readOnly?: boolean;
    /** Valeur de `required` sur l'input HTML. */
    required?: boolean;
    /** Nombre de lignes pour le <textarea> (si `multiline`). */
    rows?: number;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `supportingText` ou `maxLength`. Par défaut : "auto". */
    showSupportingText?: "always" | "auto" | "never";
    /** Préfixe à poser après le texte. */
    suffix?: string;
    /** Texte à afficher en dessous du champ. Sera affiché en rouge si `error`. */
    supportingText?: string;
    /** `tabindex` pour l'input HTML. */
    tabIndex?: number;
    /** Définition des icônes à poser après le texte dans le champ. */
    trailing?: TrailingIcon | TrailingIcon[];
    /** CSS. */
    theme?: CSSProp<TextFieldCss>;
    /** `type` pour l'input HTML. */
    type?: string;
    /** Valeur du champ. */
    value?: string;
}

export const TextField = forwardRef(function TextField(
    {
        autoComplete,
        className,
        disabled = false,
        error,
        hint,
        icon,
        id,
        label,
        maxLength,
        multiline = false,
        name,
        onBlur,
        onChange,
        onClick,
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
        readOnly,
        required = false,
        rows = 1,
        showSupportingText = "auto",
        supportingText,
        suffix,
        tabIndex,
        theme: pTheme,
        trailing,
        type = "text",
        value
    }: TextFieldProps,
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
    const theme = useTheme("textField", textFieldCss, pTheme);

    const rootNode = useRef<HTMLDivElement>(null);
    const outlineNode = useRef<HTMLDivElement>(null);
    const labelNode = useRef<HTMLDivElement>(null);
    const inputNode = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => inputNode.current!, []);

    const [hasFocus, setHasFocus] = useState(false);
    const [loading, setLoading] = useState(true);
    const smallLabelWidth = useRef(0);

    useEffect(() => {
        if (labelNode.current) {
            const width = labelNode.current.getBoundingClientRect().width * (value?.length ? 1 : 0.75);
            smallLabelWidth.current = width;
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (labelNode.current && outlineNode.current) {
            if (!hasFocus && value?.length === 0) {
                const length = labelNode.current.getBoundingClientRect().width;
                outlineNode.current.style.clipPath = `polygon(
                    0 0,
                    ${CUT_START + length / 2}px 0,
                    ${CUT_START + length / 2}px 8px,
                    ${CUT_START + length / 2}px 8px,
                    ${CUT_START + length / 2}px 0,
                    100% 0,
                    100% 100%,
                    0 100%,
                    0 0
                )`;
            } else {
                const length = smallLabelWidth.current;
                const end = CUT_START + length + 8;
                outlineNode.current.style.clipPath = `polygon(
                    0 0,
                    ${CUT_START}px 0,
                    ${CUT_START}px 8px,
                    ${end}px 8px,
                    ${end}px 0,
                    100% 0,
                    100% 100%,
                    0 100%,
                    0 0
                )`;
            }
        }
    }, [hasFocus, value]);

    const handleFocus = useCallback(
        function handleFocus(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
            setHasFocus(true);
            onFocus?.(e);
        },
        [onFocus]
    );

    const handleBlur = useCallback(
        function handleBlur(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
            if (!rootNode.current?.contains(e.relatedTarget)) {
                setHasFocus(false);
                onBlur?.(e);
            }
        },
        [onBlur]
    );

    const handleChange = useCallback(
        function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
            const newValue = e.target.value.substring(0, maxLength);
            onChange?.(newValue, e);
        },
        [maxLength, onChange]
    );

    const handleClick = useCallback(
        function handleClick(e: MouseEvent<HTMLDivElement>) {
            setHasFocus(true);
            inputNode.current?.focus();
            onClick?.(e);
        },
        [onClick]
    );

    const trailings = Array.isArray(trailing) ? trailing : trailing ? [trailing] : [];

    const inputElementProps = {
        ref: inputNode as any,
        autoComplete,
        className: theme.input(),
        disabled,
        id,
        name,
        maxLength,
        onBlur: handleBlur,
        onChange: handleChange,
        onContextMenu,
        onFocus: handleFocus,
        onKeyDown,
        onKeyPress,
        onKeyUp,
        onPaste,
        onPointerDown,
        onPointerEnter,
        onPointerLeave,
        onPointerUp,
        placeholder: hint && !label ? hint : undefined,
        readOnly,
        required,
        tabIndex,
        type,
        value
    };

    return (
        <div
            ref={rootNode}
            className={classNames(
                theme.textField({
                    disabled,
                    error,
                    loading,
                    filled: !!value?.length,
                    focused: hasFocus,
                    leadingIcon: !!icon,
                    trailingIcon: trailings.length > 0
                }),
                className
            )}
        >
            <div className={theme.field()} onClick={handleClick} tabIndex={-1}>
                <div ref={outlineNode} className={theme.outline()} />
                {icon ? (
                    <div className={theme.icon({leading: true})}>
                        <FontIcon>{icon}</FontIcon>
                    </div>
                ) : null}
                {label ? (
                    <div ref={labelNode} className={theme.label()}>
                        {label}
                    </div>
                ) : null}
                <div className={theme.inputContainer()}>
                    {prefix && !multiline && (hasFocus || !!value?.length) ? (
                        <span className={theme.prefix()}>{prefix}</span>
                    ) : null}
                    {multiline ? <textarea {...inputElementProps} rows={rows} /> : <input {...inputElementProps} />}
                    {suffix && !multiline && (hasFocus || !!value?.length) ? (
                        <span className={theme.suffix()}>{suffix}</span>
                    ) : null}
                </div>
                {trailings.map((t, i) => {
                    const iconElement = t.onClick ? (
                        <IconButton
                            key={i}
                            className={theme.trailingButton({error: t.error})}
                            disabled={disabled}
                            icon={t.icon}
                            onClick={t.onClick}
                        />
                    ) : (
                        <div key={i} className={theme.icon({error: t.error, trailing: true})}>
                            <FontIcon>{t.icon}</FontIcon>
                        </div>
                    );
                    if (t.tooltip) {
                        return (
                            <Tooltip key={i} theme={{content: theme.tooltip({error: t.error})}} tooltip={t.tooltip}>
                                {iconElement}
                            </Tooltip>
                        );
                    } else {
                        return iconElement;
                    }
                })}
            </div>
            {showSupportingText === "always" || (showSupportingText === "auto" && (!!supportingText || !!maxLength)) ? (
                <div className={theme.supportingText()}>
                    <div>{supportingText}</div>
                    {maxLength ? (
                        <div>
                            {value?.length ?? 0}/{maxLength}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
});