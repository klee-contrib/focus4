import classnames from "classnames";
import {MouseEvent, MouseEventHandler, ReactNode, TouchEventHandler, useCallback, useEffect} from "react";
import {TABS} from "react-toolbox/lib/identifiers";
import {TabTheme} from "react-toolbox/lib/tabs/Tab";

import {CSSProp, useTheme} from "@focus4/styling";
import rtTabsTheme from "react-toolbox/components/tabs/theme.css";
const tabTheme: TabTheme = rtTabsTheme;
export {TabTheme};

import {FontIcon} from "../font-icon";
import {rippleFactory} from "../ripple";

export interface TabProps {
    /** If true, the current component is visible. */
    active?: boolean;
    /** Additional class name to provide custom styling for the active tab. */
    activeClassName?: string;
    children?: ReactNode;
    className?: string;
    /** If true, the current component is not clickable. */
    disabled?: boolean;
    /** If true, the current component is not visible. */
    hidden?: boolean;
    /** Icon to be used in inner FontIcon. */
    icon?: ReactNode;
    index?: number;
    /** Label text for navigation header. */
    label?: string;
    /** Callback function that is fired when the tab is activated. */
    onActive?: () => void;
    onClick?: (event: MouseEvent<HTMLDivElement>, index: number) => void;
    onMouseDown?: MouseEventHandler<HTMLDivElement>;
    onTouchStart?: TouchEventHandler<HTMLDivElement>;
    /** Classnames object defining the component style. */
    theme?: CSSProp<TabTheme>;
}

export const Tab = rippleFactory({theme: {rippleWrapper: (tabTheme as any).rippleWrapper}})(function RTTab({
    active = false,
    activeClassName = "",
    className = "",
    children,
    disabled = false,
    hidden = false,
    icon,
    index = 0,
    label,
    onActive,
    onClick,
    onMouseDown,
    onTouchStart,
    theme: pTheme
}: TabProps) {
    const theme = useTheme(TABS, tabTheme, pTheme);
    const _className = classnames(
        theme.label(),
        {
            [theme.active()]: active,
            [theme.hidden()]: hidden,
            [theme.withText()]: label,
            [theme.withIcon()]: icon,
            [theme.disabled()]: disabled,
            [activeClassName]: active
        },
        className
    );

    useEffect(() => {
        if (active) {
            onActive?.();
        }
    }, [active, onActive]);

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (!disabled && onClick) {
                onClick(event, index);
            }
        },
        [disabled, index, onClick]
    );

    return (
        <div
            data-react-toolbox="tab"
            role="tab"
            tabIndex={0}
            className={_className}
            onClick={handleClick}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {icon && <FontIcon className={(theme as any).icon?.()} value={icon} />}
            {label}
            {children}
        </div>
    );
});
