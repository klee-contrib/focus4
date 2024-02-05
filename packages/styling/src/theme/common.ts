import {createContext} from "react";

export type CSSElement<T> = T & string & {_element: void};
export type CSSMod<N extends string, T> = N & T & string & {_mod: void};
export type CSSToStrings<T> = {[P in keyof T]?: string};

export type Mods<CSS, E> = {[P in keyof CSS]: CSS[P] extends CSSMod<infer M, E> ? M : never}[keyof CSS];
export type ModNames<CSS, E> = {[P in keyof CSS]: CSS[P] extends CSSMod<infer _, E> ? P : never}[keyof CSS];
export type BemFunction<CSS = any, P extends number | string | symbol = any, E = any> = ((object: true) => {
    [_ in ModNames<CSS, E> | P]: string;
}) &
    (Mods<CSS, E> extends never | undefined ? () => string : (mods?: {[_ in Mods<CSS, E>]?: boolean}) => string);

export interface CSSTheme {
    [key: string]: BemFunction | string;
}

export interface CSSContext {
    [key: string]: CSSTheme;
}

export const ThemeContext = createContext<CSSContext>({});
