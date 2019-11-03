import {createContext} from "react";

export type CSSElement<T> = string & T & {_element: void};
export type CSSMod<N extends string, T> = string & N & T & {_mod: void};
export type CSSToStrings<T> = {[P in keyof T]?: string};

export interface CSSContext {
    [key: string]: Record<string, string>;
}

export const ThemeContext = createContext<CSSContext>({});
