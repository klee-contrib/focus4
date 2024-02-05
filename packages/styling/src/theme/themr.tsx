import {upperFirst} from "lodash";
import {useObserver} from "mobx-react";
import {FunctionComponent, ReactElement} from "react";

import {CSSToStrings} from "./common";
import {ToBem} from "./to-bem";
import {useTheme} from "./use-theme";

export interface ThemeConsumerProps<T> {
    children: (theme: ToBem<T>) => ReactElement;
    theme?: CSSToStrings<T> | Partial<ToBem<T>> | T;
}

/**
 * Permet de créer un composant wrapper pour utiliser `useTheme` dans le `render()` d'un composant classe.
 * @param name Le nom de la clé de theme.
 * @param localTheme Le theme local, fourni par le composant.
 */
export function themr<T>(name: string, localTheme?: T): FunctionComponent<ThemeConsumerProps<T>> {
    function TC({children, theme}: ThemeConsumerProps<T>) {
        const finalTheme = useTheme(name, localTheme, theme);
        return useObserver(() => children(finalTheme));
    }

    TC.displayName = `${upperFirst(name)}ThemeConsumer`;

    return TC;
}
