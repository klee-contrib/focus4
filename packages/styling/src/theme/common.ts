import {createContext} from "react";

export type CSSElement<T> = string & T & {_element: void};
export type CSSMod<N extends string, T> = string & N & T & {_mod: void};
export type CSSToStrings<T> = {[P in keyof T]?: string};

export type Mods<CSS, E> = {[P in keyof CSS]: CSS[P] extends CSSMod<infer M, E> ? M : never}[keyof CSS];
export type ModNames<CSS, E> = {[P in keyof CSS]: CSS[P] extends CSSMod<infer _, E> ? P : never}[keyof CSS];
export type BemFunction<CSS = any, P extends string | number | symbol = any, E = any> = (Mods<CSS, E> extends
    | never
    | undefined
    ? () => string
    : (mods?: {[_ in Mods<CSS, E>]?: boolean}) => string) &
    ((object: true) => {[_ in P | ModNames<CSS, E>]: string});

export interface CSSContext {
    [key: string]: {[key: string]: string | BemFunction};
}

export const ThemeContext = createContext<CSSContext>({});
