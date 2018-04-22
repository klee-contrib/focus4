import {upperFirst} from "lodash";
import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";
import {themeable} from "react-css-themr";

export type ThemeConsumer<T> = React.ComponentClass<{
    children: (theme: T) => React.ReactElement<any>;
    theme?: Partial<T>;
}>;

/**
 * Crée un composant pour injecter le theme souhaité dans un composant, via une render props (à la place du HoC de `react-css-themr`).
 * @param name Le nom de la clé de theme.
 * @param localTheme Le theme local, fourni par le composant.
 */
export function themr<T>(name: string, localTheme?: T): ThemeConsumer<T> {
    @observer
    class TC extends React.Component<{children: (theme: T) => React.ReactElement<any>; theme?: Partial<T>}> {
        static displayName = `${upperFirst(name)}ThemeConsumer`;

        static contextTypes = {
            themr: PropTypes.object
        };

        context!: {themr?: {theme: {[key: string]: any}}};

        render() {
            const {children, theme} = this.props;
            return children(themeable(
                localTheme || {},
                (this.context.themr && this.context.themr.theme[name]) || {},
                (theme as any) || {}
            ) as any);
        }
    }

    return TC;
}
