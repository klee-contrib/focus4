import classnames from "classnames";
import i18next from "i18next";
import {CSSProperties} from "react";

import {config} from "@focus4/core";

import {PointerEvents} from "../utils/pointer-events";

/**
 * Définition d'une icône. Peut être :
 *
 * - Le nom d'une icône, utilisera la classe CSS définie dans `config.defaultIconClassName` (par défaut : "material-symbols-outlined").
 * - Un objet `{name, className?}`, décrivant le nom le icône et sa classe CSS associée (la classe par défaut sera sélectionnée si `className` n'est pas renseigné).
 * - Une clé i18n pointant vers un objet `{name, className?}`.
 *
 * La classe CSS sera interprétée comme un template du nom si elle contient `{name}` dans sa définition.
 * Dans ce cas, le `name` ne sera pas posé en enfant du `<span>` qui définira l'icône.
 */
export type Icon = string | {className: string; name: string} | {i18nKey: string};

export interface FontIconProps extends PointerEvents<HTMLSpanElement> {
    /** Texte alternatif pour l'icône. */
    alt?: string;
    /** Classe CSS à poser sur le composant racine. */
    className?: string;
    /** Icône à afficher. */
    children: Icon;
    /** Styles inline */
    style?: CSSProperties;
}

/**
 * Affiche une icône. Prend une `Icon` comme enfant.
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
    let inputClassName = config.defaultIconClassName;
    let inputName;

    if (typeof children === "string") {
        inputName = children;
    } else if ("name" in children) {
        inputName = children.name;
        if (children.className) {
            inputClassName = children.className;
        }
    } else {
        inputName = i18next.t(`${children.i18nKey}.name`);
        const classNameKey = `${children.i18nKey}.className`;
        const i18nClassName = i18next.t(classNameKey);
        if (i18nClassName !== classNameKey) {
            inputClassName = i18nClassName;
        }
    }

    let baseClassName;
    let name;

    if (inputClassName.includes("{name}")) {
        baseClassName = inputClassName.replaceAll("{name}", inputName);
    } else {
        baseClassName = inputClassName;
        name = inputName;
    }

    return (
        <span
            aria-label={alt}
            className={classnames(baseClassName, className)}
            onPointerDown={onPointerDown}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerUp={onPointerUp}
            style={style}
        >
            {name}
        </span>
    );
}
