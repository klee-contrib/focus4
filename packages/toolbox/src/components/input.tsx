import classnames from "classnames";
import {ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef} from "react";
import {INPUT} from "react-toolbox/lib/identifiers";
import {InputProps as RTInputProps, InputTheme} from "react-toolbox/lib/input/Input";
import {isValuePresent} from "react-toolbox/lib/utils/utils";

import {CSSProp, useTheme} from "@focus4/styling";
import rtInputTheme from "react-toolbox/components/input/theme.css";
const inputTheme: InputTheme = rtInputTheme;
export {inputTheme};

import {FontIcon} from "./font-icon";

type InputProps = Omit<RTInputProps, "theme"> & {theme?: CSSProp<InputTheme>};
interface InputRef {
    blur: () => void;
    focus: () => void;
    inputNode: HTMLInputElement | HTMLTextAreaElement;
}
export {InputProps, InputRef, InputTheme};

export const Input = forwardRef(function InputBase(
    {
        children,
        disabled = false,
        error,
        floating = true,
        hint = "",
        icon,
        label: labelText,
        maxLength,
        multiline = false,
        name,
        onBlur,
        onChange,
        onClick,
        onContextMenu,
        onDoubleClick,
        onDrag,
        onDragEnd,
        onDragEnter,
        onDragExit,
        onDragLeave,
        onDragOver,
        onDragStart,
        onDrop,
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
        onTouchCancel,
        onTouchEnd,
        onTouchMove,
        onTouchStart,
        required = false,
        rows = 1,
        style,
        theme: pTheme,
        type = "text",
        value
    }: InputProps,
    ref: ForwardedRef<InputRef>
) {
    const theme = useTheme(INPUT, inputTheme, pTheme);
    const inputNode = useRef<any>(null);

    const handleAutoresize = useCallback(() => {
        if (inputNode.current) {
            if (typeof rows === "number" && !Number.isNaN(rows)) {
                inputNode.current.style.height = "";
            } else {
                // compute the height difference between inner height and outer height
                const inputStyle = getComputedStyle(inputNode.current, null);
                const heightOffset =
                    inputStyle.boxSizing === "content-box"
                        ? -(parseFloat(inputStyle.paddingTop) + parseFloat(inputStyle.paddingBottom))
                        : parseFloat(inputStyle.borderTopWidth) + parseFloat(inputStyle.borderBottomWidth);

                // resize the input to its content size
                inputNode.current.style.height = "auto";
                inputNode.current.style.height = `${inputNode.current.scrollHeight + heightOffset}px`;
            }
        }
    }, [rows]);

    useEffect(() => {
        if (multiline) {
            window.addEventListener("resize", handleAutoresize);
        }
        return () => {
            if (multiline) {
                window.removeEventListener("resize", handleAutoresize);
            }
        };
    }, [multiline, rows]);

    useEffect(() => {
        if (multiline) {
            handleAutoresize();
        }
    });

    useImperativeHandle(
        ref,
        () => ({
            focus() {
                inputNode.current.focus();
            },

            blur() {
                inputNode.current.blur();
            },
            inputNode: inputNode.current
        }),
        []
    );

    const handleChange = useCallback(
        event => {
            const valueFromEvent = event.target.value;
            // Trim value to maxLength if that exists (only on multiline inputs).
            // Note that this is still required even tho we have the onKeyPress filter
            // because the user could paste smt in the textarea.
            const haveToTrim = multiline && maxLength && event.target.value.length > maxLength;
            const newValue = haveToTrim ? valueFromEvent.substr(0, maxLength) : valueFromEvent;

            // propagate to to store and therefore to the input
            if (onChange) {
                onChange(newValue, event);
            }
        },
        [onChange, multiline, maxLength]
    );

    const handleKeyPress = useCallback(
        event => {
            // prevent insertion of more characters if we're a multiline input
            // and maxLength exists
            if (multiline && maxLength) {
                // check if smt is selected, in which case the newly added charcter would
                // replace the selected characters, so the length of value doesn't actually
                // increase.
                const isReplacing = event.target.selectionEnd - event.target.selectionStart;
                const {value: newValue} = event.target;

                if (!isReplacing && newValue.length === maxLength) {
                    event.preventDefault();
                    event.stopPropagation();
                    return undefined;
                }
            }

            if (onKeyPress) {
                onKeyPress(event);
            }
            return undefined;
        },
        [multiline, maxLength, onKeyPress]
    );

    const length = maxLength && value ? value.length : 0;
    const valuePresent = isValuePresent(value);

    const className = classnames(theme.input(), {
        [theme.disabled()]: disabled,
        [theme.errored()]: error,
        [theme.hidden()]: type === "hidden",
        [theme.withIcon()]: icon
    });
    const labelClassName = classnames(theme.label(), {[(theme as any).fixed()]: !floating});
    const inputElementProps = {
        className: classnames(theme.inputElement(), {[(theme as any).filled()]: valuePresent}),
        onChange: handleChange,
        ref: inputNode,
        disabled,
        name,
        onBlur,
        onClick,
        onContextMenu,
        onFocus,
        onKeyDown,
        onDoubleClick,
        onDrag,
        onDragEnd,
        onDragEnter,
        onDragExit,
        onDragLeave,
        onDragOver,
        onDragStart,
        onDrop,
        onKeyUp,
        onMouseDown,
        onMouseEnter,
        onMouseLeave,
        onMouseMove,
        onMouseOut,
        onMouseOver,
        onMouseUp,
        onTouchCancel,
        onTouchEnd,
        onTouchMove,
        onTouchStart,
        required,
        style,
        type,
        value
    };

    return (
        <div data-react-toolbox="input" className={className}>
            {multiline ? (
                <textarea {...(inputElementProps as any)} rows={rows} onKeyPress={handleKeyPress} />
            ) : (
                <input {...(inputElementProps as any)} maxLength={maxLength} onKeyPress={onKeyPress as any} />
            )}
            {icon ? <FontIcon className={theme.icon()} value={icon} /> : null}
            <span className={theme.bar()} />
            {labelText ? (
                <label className={labelClassName}>
                    {labelText}
                    {required ? <span className={theme.required()}> * </span> : null}
                </label>
            ) : null}
            {hint ? (
                <span hidden={!!labelText} className={theme.hint()}>
                    {hint}
                </span>
            ) : null}
            {error ? <span className={theme.error()}>{error}</span> : null}
            {maxLength ? <span className={theme.counter()}>{`${length}/${maxLength}`}</span> : null}
            {children}
        </div>
    );
});
