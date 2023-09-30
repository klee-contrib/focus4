import classnames from "classnames";
import {CSSProperties, ReactNode} from "react";

import {PointerEvents} from "../utils/pointer-events";

export interface FontIconProps extends PointerEvents<HTMLSpanElement> {
    /** Texte alternatif pour l'icône. */
    alt?: string;
    /** Classe CSS à poser sur le composant racine. */
    className?: string;
    /** Icône à afficher. */
    children?: ReactNode;
    /** Styles inline */
    style?: CSSProperties;
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
    style
}: FontIconProps) {
    return (
        <span
            aria-label={alt}
            className={classnames({"material-icons": typeof children === "string"}, className)}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
            style={style}
        >
            {children}
        </span>
    );
}
