import {upperFirst} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import {themeable, TReactCSSThemrTheme} from "@focus4/core";

export const ThemeContext = React.createContext({} as TReactCSSThemrTheme);
export type CSSMod<N extends string, T> = string & N & T & {_mod: void};
export type CSSElement<T> = string & T & {_element: void};
export type CSSToStrings<T> = {[P in keyof T]?: string};

type Elements<T> = {[P in keyof T]: T[P] extends CSSElement<infer _> ? P : never}[keyof T];
type Mods<T, A> = {[P in keyof T]: T[P] extends CSSMod<infer N, A> ? N : never}[keyof T];
type ToBem<T> = Pick<
    {
        [P in keyof T]: T[P] extends CSSElement<infer A> ? ((mods?: {[Q in Mods<T, A>]?: boolean}) => string) : never;
    },
    Elements<T>
>;

export function toBem<T>(css: T): ToBem<T> {
    return css as any;
}

/** Hook pour récupérer le theme du contexte et le fusionner avec d'autres. */
export function useTheme<T = any>(name: string, ...themes: (T | CSSToStrings<T> | undefined)[]): T {
    const contextTheme = React.useContext(ThemeContext)[name];
    return (themeable((contextTheme as {}) || {}, ...(themes.filter(Boolean) as {}[])) as unknown) as T;
}

export interface ThemeConsumerProps<T> {
    children: (theme: T) => React.ReactElement;
    theme?: T | CSSToStrings<T>;
}

export type ThemeConsumer<T> = React.ComponentClass<ThemeConsumerProps<T>>;

/**
 * Crée un composant pour injecter le theme souhaité dans un composant, via une render props (à la place du HoC de `react-css-themr`).
 * @param name Le nom de la clé de theme.
 * @param localTheme Le theme local, fourni par le composant.
 */
export function themr<T>(name: string, localTheme?: T): ThemeConsumer<T> {
    @observer
    class TC extends React.Component<ThemeConsumerProps<T>> {
        static displayName = `${upperFirst(name)}ThemeConsumer`;

        static contextType = ThemeContext;
        context!: React.ContextType<typeof ThemeContext>;

        render() {
            const {children, theme} = this.props;
            return children(themeable(localTheme || {}, (this.context[name] as {}) || {}, (theme as any) || {}) as any);
        }
    }

    return TC;
}
