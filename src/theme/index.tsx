import {upperFirst} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";
import {themeable} from "react-css-themr";

import {ThemeContext} from "../layout";

export interface ThemeConsumerProps<T> {
    children: (theme: T) => React.ReactElement<any>;
    onMountOrUpdate?: () => void;
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

        componentDidMount() {
            if (this.props.onMountOrUpdate) {
                this.props.onMountOrUpdate();
            }
        }

        componentWillUpdate() {
            if (this.props.onMountOrUpdate) {
                this.props.onMountOrUpdate();
            }
        }

        render() {
            const {children, theme} = this.props;
            return children(themeable(localTheme || {}, (this.context[name] as {}) || {}, (theme as any) || {}) as any);
        }
    }

    return TC;
}
