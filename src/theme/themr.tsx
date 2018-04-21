import {Observer} from "mobx-react";
import * as React from "react";
import {themeable} from "react-css-themr";

import {ThemeContext} from "./context";

export function themr<T>(name: string, localTheme?: T) {
    return function ThemeConsumer({children, theme}: {children: (theme: T) => React.ReactElement<any>, theme?: Partial<T>}) {
        return (
            <ThemeContext.Consumer>
                {context => <Observer>{() => children(themeable(localTheme || {}, context && context[name] || {}, theme as any || {}) as any)}</Observer>}
            </ThemeContext.Consumer>
        );
    };
}
