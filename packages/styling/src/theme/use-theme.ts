import {useContext} from "react";

import {themeable} from "@focus4/core";

import {CSSToStrings, ThemeContext} from "./common";
import {toBem} from "./to-bem";

/** Hook pour récupérer le theme du contexte et le fusionner avec d'autres. */
export function useTheme<T = any>(name: string, ...themes: (T | CSSToStrings<T> | undefined)[]) {
    const contextTheme = useContext(ThemeContext)[name];
    return toBem((themeable((contextTheme as {}) || {}, ...(themes.filter(Boolean) as {}[])) as unknown) as T);
}
