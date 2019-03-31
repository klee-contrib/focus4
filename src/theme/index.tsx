import {upperFirst} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";
import {themeable, TReactCSSThemrTheme} from "react-css-themr";

export const ThemeContext = React.createContext({} as TReactCSSThemrTheme);

/** Hook pour récupérer le theme du contexte et le fusionner avec d'autres. */
export function useTheme<T>(name: string, ...themes: (Partial<T> | undefined)[]): T {
    const contextTheme = React.useContext(ThemeContext)[name];
    return (themeable((contextTheme as {}) || {}, ...(themes.filter(Boolean) as {}[])) as unknown) as T;
}

export interface ThemeConsumerProps<T> {
    children: (theme: T) => React.ReactElement;
    theme?: Partial<T>;
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
