import classnames from "classnames";
import {CSSProperties, ReactNode} from "react";

import {PointerEvents} from "../utils/pointer-events";

export interface FontIconProps extends PointerEvents<HTMLSpanElement> {
    /** Alt text for the icon. */
    alt?: string;
    className?: string;
    /** Children to pass through the component. */
    children?: ReactNode;
    /** Inline styles. */
    style?: CSSProperties;
    /** The key string for the icon you want be displayed. */
    value?: ReactNode;
}

/**
 * Affiche une icône. Prend directement un nom d'icône Material en enfant, ou bien une icône personnalisée avec `getIcon`.
 */
export function FontIcon({
    alt = "",
    className = "",
    children,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    style,
    value
}: FontIconProps) {
    return (
        <span
            aria-label={alt}
            className={classnames(
                {"material-icons": typeof value === "string" || typeof children === "string"},
                className
            )}
            data-react-toolbox="font-icon"
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
            style={style}
        >
            {value}
            {children}
        </span>
    );
}
