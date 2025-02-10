import classnames from "classnames";
import i18next from "i18next";
import {CSSProperties} from "react";

import {uiConfig} from "@focus4/styling";

import {PointerEvents} from "../utils/pointer-events";

/**
 * Définition d'une icône. Peut être :
 *
 * - Le nom d'une icône, utilisera la classe CSS définie dans `uiConfig.defaultIconClassName` (par défaut : `"material-icons"`).
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
    /**
     * Nom de l'icône à afficher. Ne sera pas posé en enfant du <span> si la classe CSS de l'icône est un template de `{name}`.
     *
     * Ignoré si `iconI18nKey` est renseigné.
     */
    children?: string;
    /**
     * Définition d'icône mixte, peut être utilisé à la place de `children` / `iconClassName` / `iconI18nKey`.
     *
     * N'a pas la priorité sur ces définitions-là.
     */
    icon?: Icon;
    /**
     * Classe CSS de l'icône, pour retrouver la police associée. Peut être utilisée comme template du nom de l'icône (en y remplaçant `{name}`).
     *
     * Ignoré si `iconI18nKey` est renseigné.
     */
    iconClassName?: string;
    /**
     * Clé i18n pour retrouver l'icône. Doit correspondre à un objet `{name, className?}`.
     *
     * Remplace `children` et `iconClassName`.
     */
    iconI18nKey?: string;
    /** Styles inline. */
    style?: CSSProperties;
}

/**
 * Affiche une icône. Une icône est définie par son nom et sa classe CSS, qui servira à retrouver la police d'icône associée.
 *
 * Une icône définie avec seulement un nom utilisera la classe CSS définie dans `uiConfig.defaultIconClassName` (par défaut : `"material-icons"`).
 *
 * La classe CSS sera interprétée comme un template du nom si elle contient `{name}` dans sa définition.
 * Dans ce cas, le `name` ne sera pas posé en enfant du `<span>` qui définira l'icône.
 *
 * Une icône peut également être définie via une [clé i18n](/docs/les-bases-libellés-et-icônes--docs), qui devra pointer vers un objet `{name, className?}` représentant l'icône.
 */
export function FontIcon({
    icon,
    alt = "",
    className = "",
    children = typeof icon === "string" ? icon : typeof icon === "object" && "name" in icon ? icon.name : undefined,
    iconClassName = typeof icon === "object" && "className" in icon ? icon.className : uiConfig.defaultIconClassName,
    iconI18nKey = typeof icon === "object" && "i18nKey" in icon ? icon.i18nKey : undefined,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
    style
}: FontIconProps) {
    if (iconI18nKey) {
        const nameKey = `${iconI18nKey}.name`;
        const i18nName = i18next.t(nameKey);
        if (i18nName !== nameKey) {
            children = i18nName;
        }
        const classNameKey = `${iconI18nKey}.className`;
        const i18nClassName = i18next.t(classNameKey);
        if (i18nClassName !== classNameKey) {
            iconClassName = i18nClassName;
        }
    }

    let baseClassName;
    let name;

    if (iconClassName.includes("{name}")) {
        baseClassName = iconClassName.replaceAll("{name}", children ?? "");
    } else {
        baseClassName = iconClassName;
        name = children;
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
