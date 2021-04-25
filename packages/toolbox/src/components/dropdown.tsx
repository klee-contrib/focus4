import classnames from "classnames";
import {
    FocusEvent,
    FocusEventHandler,
    MouseEvent,
    MouseEventHandler,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {DROPDOWN} from "react-toolbox/lib/identifiers";
import {DropdownTheme} from "react-toolbox/lib/dropdown/Dropdown";
import events from "react-toolbox/lib/utils/events";

import {CSSProp, useTheme} from "@focus4/styling";

import {Input} from "./input";

import rtDropdownTheme from "react-toolbox/components/dropdown/theme.css";
const dropdownTheme: DropdownTheme = rtDropdownTheme;
export {dropdownTheme, DropdownTheme};

export interface DropdownProps<
    T,
    VK extends string = "value",
    LK extends string = "label",
    S extends {[P in VK]?: T} & {[P in LK]?: string} = any
> {
    /** If true the dropdown will preselect the first item if the supplied value matches none of the options' values. */
    allowBlank?: boolean;
    /** If true, the dropdown will open up or down depending on the position in the screen. */
    auto?: boolean;
    /** CSS class for the root component. */
    className?: string;
    /** If true, component will be disabled. */
    disabled?: boolean;
    /** Give an error node to display under the field. */
    error?: React.ReactNode;
    /** Used for setting the label from source */
    labelKey?: LK;
    /** Id for the input field. */
    id?: string;
    /** The text string to use for the floating label element. */
    label?: React.ReactNode;
    /** Name for the input field. */
    name?: string;
    onBlur?: (
        event: FocusEvent<HTMLDivElement | HTMLInputElement | HTMLTextAreaElement> | MouseEvent<HTMLLIElement>
    ) => void;
    onChange?: (value: T, event: MouseEvent<HTMLLIElement>) => void;
    onClick?: MouseEventHandler<HTMLDivElement | HTMLInputElement | HTMLTextAreaElement>;
    onFocus?: FocusEventHandler<HTMLDivElement>;
    /** If true, the html input has a required attribute. */
    required?: boolean;
    /** Array of data objects with the data to represent in the dropdown. */
    source: S[];
    /** Callback function that returns a JSX template to represent the element. */
    template?: (item: S) => JSX.Element;
    /** Classnames object defining the component style. */
    theme?: CSSProp<DropdownTheme>;
    /** Current value of the dropdown element. */
    value?: T;
    /** Used for setting the value from source */
    valueKey?: VK;
}

export function Dropdown<
    T,
    VK extends string = "value",
    LK extends string = "label",
    S extends {[P in VK]?: T} & {[P in LK]?: string} = any
>({
    allowBlank = true,
    auto = true,
    className: pClassName,
    disabled = false,
    error,
    id,
    label,
    labelKey = "label" as LK,
    name,
    onBlur,
    onChange,
    onClick,
    onFocus,
    required = false,
    source,
    template,
    value,
    valueKey = "value" as VK,
    theme: pTheme
}: DropdownProps<T, VK, LK, S>) {
    const theme = useTheme(DROPDOWN, dropdownTheme, pTheme);

    const domNode = useRef<HTMLDivElement | null>(null);
    const [active, setActive] = useState(false);
    const [up, setUp] = useState(false);

    useEffect(() => {
        function handleDocumentClick(event: MouseEvent) {
            if (!events.targetIsDescendant(event, domNode.current)) {
                setActive(false);
            }
        }
        if (active) {
            events.addEventsToDocument({click: handleDocumentClick, touchend: handleDocumentClick});
        }
        return () => {
            if (active) {
                events.removeEventsFromDocument({click: handleDocumentClick, touchend: handleDocumentClick});
            }
        };
    }, [active]);

    const open = useCallback(
        (event: SyntheticEvent<HTMLDivElement | HTMLInputElement | HTMLTextAreaElement>) => {
            if (active) {
                return;
            }
            setActive(true);
            const client = event.currentTarget.getBoundingClientRect();
            const screenHeight = window.innerHeight || document.documentElement.offsetHeight;
            setUp(auto ? client.top > screenHeight / 2 + client.height : false);
        },
        [active, auto]
    );

    const handleBlur = useCallback(
        (event: FocusEvent<HTMLDivElement>) => {
            event.stopPropagation();
            setActive(false);
            onBlur?.(event);
        },
        [onBlur]
    );

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement | HTMLInputElement | HTMLTextAreaElement>) => {
            open(event);
            events.pauseEvent(event);
            onClick?.(event);
        },
        [onClick, open]
    );

    const handleFocus = useCallback(
        (event: FocusEvent<HTMLDivElement>) => {
            event.stopPropagation();
            if (!disabled) {
                open(event);
            }
            onFocus?.(event);
        },
        [disabled, onFocus, open]
    );

    const handleSelect = useCallback(
        (item: T, event: MouseEvent<HTMLLIElement>) => {
            events.pauseEvent(event);
            onBlur?.(event);
            if (!disabled && onChange) {
                onChange(item, event);
                setActive(false);
            }
        },
        [disabled, onBlur, onChange]
    );

    const renderTemplateValue = useCallback(
        (selected: S) => {
            const className = classnames(theme.field(), {
                [theme.errored()]: error,
                [theme.disabled()]: disabled,
                [theme.required()]: required
            });

            return (
                <div className={className} onClick={handleClick}>
                    <div className={`${theme.templateValue()} ${theme.value()}`}>{template!(selected)}</div>
                    {label ? (
                        <label className={theme.label()}>
                            {label}
                            {required ? <span className={theme.required()}> * </span> : null}
                        </label>
                    ) : null}
                    {error ? <span className={theme.error()}>{error}</span> : null}
                </div>
            );
        },
        [disabled, error, handleClick, label, required, template, theme]
    );

    const renderValue = useCallback(
        (item: S, idx: number) => {
            const className = classnames({
                [theme.selected()]: item[valueKey] === value,
                [theme.disabled()]: (item as any).disabled
            });
            return (
                <li
                    key={idx}
                    className={className}
                    onMouseDown={!(item as any).disabled ? event => handleSelect(item[valueKey]!, event) : undefined}
                >
                    {template ? template(item) : item[labelKey]}
                </li>
            );
        },
        [labelKey, template, theme, value, valueKey]
    );

    const selected = useMemo(() => {
        for (const item of source) {
            if (item[valueKey] === value) {
                return item;
            }
        }
        return !allowBlank ? source[0] : undefined;
    }, [allowBlank, source, value]);

    const className = classnames(
        theme.dropdown(),
        {
            [theme.up()]: up,
            [theme.active()]: active,
            [theme.disabled()]: disabled,
            [theme.required()]: required
        },
        pClassName
    );

    return (
        <div
            ref={domNode}
            className={className}
            data-react-toolbox="dropdown"
            onBlur={handleBlur}
            onFocus={handleFocus}
            tabIndex={-1}
        >
            <Input
                className={theme.value()}
                id={id}
                name={name}
                onClick={handleClick}
                readOnly
                required={required}
                tabIndex={0}
                theme={theme}
                type={template && selected ? "hidden" : undefined}
                value={selected && selected[labelKey] ? selected[labelKey] : ""}
            />
            {template && selected ? renderTemplateValue(selected) : null}
            <ul className={theme.values()}>{source.map(renderValue)}</ul>
        </div>
    );
}
