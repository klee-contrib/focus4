import classnames from "classnames";
import {CSSProperties, MouseEventHandler, ReactNode, TouchEventHandler} from "react";

export interface FontIconProps {
    /** Alt text for the icon. */
    alt?: string;
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    onClick?: MouseEventHandler<HTMLSpanElement>;
    onMouseDown?: MouseEventHandler<HTMLSpanElement>;
    onMouseEnter?: MouseEventHandler<HTMLSpanElement>;
    onMouseLeave?: MouseEventHandler<HTMLSpanElement>;
    onTouchStart?: TouchEventHandler<HTMLSpanElement>;
    /** Inline styles. */
    style?: CSSProperties;
    /** The key string for the icon you want be displayed. */
    value?: ReactNode;
}

export function FontIcon({
    alt = "",
    className = "",
    children,
    onClick,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    style,
    value
}: FontIconProps) {
    return (
        <span
            data-react-toolbox="font-icon"
            aria-label={alt}
            className={classnames(
                {"material-icons": typeof value === "string" || typeof children === "string"},
                className
            )}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            style={style}
        >
            {value}
            {children}
        </span>
    );
}
