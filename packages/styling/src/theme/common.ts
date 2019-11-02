import {createContext} from "react";

import {TReactCSSThemrTheme} from "@focus4/core";

export type CSSElement<T> = string & T & {_element: void};
export type CSSMod<N extends string, T> = string & N & T & {_mod: void};
export type CSSToStrings<T> = {[P in keyof T]?: string};

export const ThemeContext = createContext({} as TReactCSSThemrTheme);
