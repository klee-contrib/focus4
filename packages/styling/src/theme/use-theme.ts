import {useContext} from "react";

import {themeable} from "@focus4/core";

import {CSSToStrings, ThemeContext} from "./common";
import {fromBem, toBem, ToBem} from "./to-bem";

/** Hook pour récupérer le theme du contexte et le fusionner avec d'autres. */
export function useTheme<T>(
    name: string,
    ...themes: (T | CSSToStrings<T> | Partial<ToBem<T>> | undefined)[]
): ToBem<T> {
    const contextTheme: T = (useContext(ThemeContext)[name] as any) || {};
    return toBem(themeable(contextTheme, ...themes.filter(x => x).map(x => fromBem(x!) as T)));
}
