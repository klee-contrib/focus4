import i18next from "i18next";
import * as React from "react";

/**
 * Récupère l'icône correspondante au nom.
 * @param name Le nom de l'icône.
 * @param isCustom Icône custom ou non.
 */
export function getIcon(name: React.ReactNode, isCustom: boolean): JSX.Element | string;
/**
 * Récupère l'icône par sa clé i18n.
 * @param i18nKey La clé i18n de l'icône.
 */
export function getIcon(i18nKey: string): JSX.Element | string;
export function getIcon(name?: React.ReactNode, isCustom?: boolean) {
    if (isCustom === undefined) {
        isCustom = i18next.t(`${name}.library`) !== "material";
        name = i18next.t(`${name}.name`);
    }

    if (isCustom) {
        return <span className={`icon-${name}`} />;
    } else {
        return name;
    }
}
