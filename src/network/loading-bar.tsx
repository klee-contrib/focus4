import i18next from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Icon from "focus-components/icon";

import {requestStore} from "./store";

import * as styles from "./__style__/loading-bar.css";
export type LoadingBarStyle = Partial<typeof styles>;

export interface LoadingBarProps {
    displayDevBar?: boolean;
    i18nPrefix?: string;
    ProgressBar: React.ComponentClass<{completed: number}> | React.SFC<{completed: number}>;
    theme?: LoadingBarStyle;
}

/** Composant standard pour afficher une barre de chargement sur l'état des requêtes en cours. */
export const LoadingBar = observer(({i18nPrefix = "focus", theme, displayDevBar, ProgressBar}: LoadingBarProps) => {
    const {count, error, pending, success} = requestStore;
    const completed = +((count.total - count.pending) / count.total) * 100;
    const icon = (name: string) => {
        const pre = `${i18nPrefix}.icons.loadingBar.${name}`;
        return {
            name: i18next.t(`${pre}.name`),
            library: i18next.t(`${pre}.library`)
        };
    };
    return (
        <div className={theme!.bar!}>
            {completed < 100 ? <ProgressBar completed={completed} /> : null}
            {displayDevBar ?
                <ul>
                    <li><Icon {...icon("pending")} /> pending {pending}</li>
                    <li><Icon {...icon("success")} /> success {success}</li>
                    <li><Icon {...icon("error")} /> error {error}</li>
                    <li><Icon {...icon("total")} /> total {count.total}</li>
                </ul>
            : null}
        </div>
    );
});

export default themr("loadingBar", styles)(LoadingBar);
