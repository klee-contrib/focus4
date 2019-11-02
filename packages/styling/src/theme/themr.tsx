import {upperFirst} from "lodash";
import * as React from "react";

import {CSSToStrings} from "./common";
import {ToBem} from "./to-bem";
import {useTheme} from "./use-theme";

export interface ThemeConsumerProps<T> {
    children: (theme: ToBem<T>) => React.ReactElement;
    theme?: T | CSSToStrings<T>;
}

/**
 * Crée un composant pour injecter le theme souhaité dans un composant, via une render props (à la place du HoC de `react-css-themr`).
 * @param name Le nom de la clé de theme.
 * @param localTheme Le theme local, fourni par le composant.
 */
export function themr<T>(name: string, localTheme?: T): React.FunctionComponent<ThemeConsumerProps<T>> {
    function TC({children, theme}: ThemeConsumerProps<T>) {
        return children(useTheme(name, localTheme, theme));
    }

    TC.displayName = `${upperFirst(name)}ThemeConsumer`;

    return TC;
}
