import i18next from "i18next";
import {ReactNode} from "react";

/**
 * Récupère l'icône correspondante au nom.
 * @param name Le nom de l'icône.
 * @param isCustom Icône custom ou non.
 */
export function getIcon(name: ReactNode, isCustom: boolean): JSX.Element | string;
/**
 * Récupère l'icône par sa clé i18n.
 * @param i18nKey La clé i18n de l'icône.
 */
export function getIcon(i18nKey: string): JSX.Element | string;
export function getIcon(name?: ReactNode, isCustom?: boolean) {
    if (isCustom === undefined) {
        isCustom = i18next.t(`${name as string}.library`) !== "material";
        name = i18next.t(`${name as string}.name`);
    }

    if (isCustom) {
        return <span className={`icon-${name as string}`} />;
    } else {
        return name;
    }
}
