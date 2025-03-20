import {useContext} from "react";

import {CSSToStrings, ThemeContext} from "./common";
import {themeable} from "./themeable";
import {fromBem, toBem, ToBem} from "./to-bem";

/**
 * `useTheme` permet de récupérer les classes CSS passées dans un éventuel `ThemeProvider` parent et de les fusionner avec d'autres classes CSS
 * passées en paramètre.
 *
 * `useTheme` accepte aussi bien des objets de classes CSS classiques (importés d'un module CSS), que des objets créés avec `toBem`.
 *
 * @param name L'identifiant du composant dans le `appTheme` du `ThemeProvider`
 * @param themes Les objets de classes CSS à fusionner ensemble et avec celui du contexte.
 */
export function useTheme<T>(
    name: string,
    ...themes: (CSSToStrings<T> | Partial<ToBem<T>> | T | undefined)[]
): ToBem<T> {
    const contextTheme = fromBem(useContext(ThemeContext)[name]) || {};
    return toBem(themeable(contextTheme, ...themes.filter(x => x).map(x => fromBem(x!))) as T);
}
