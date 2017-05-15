import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Icon from "focus-components/icon";

import {requestStore} from "./store";

import * as styles from "./__style__/loading-bar.css";
export type LoadingBarStyle = Partial<typeof styles>;

export interface LoadingBarProps {
    displayDevBar?: boolean;
    ProgressBar: React.ComponentClass<{completed: number}> | React.SFC<{completed: number}>;
    theme?: LoadingBarStyle;
}

/** Composant standard pour afficher une barre de chargement sur l'état des requêtes en cours. */
export const LoadingBar = themr("loadingBar", styles)(observer(({theme, displayDevBar, ProgressBar}: LoadingBarProps) => {
    const {count, error, pending, success} = requestStore;
    const completed = +((count.total - count.pending) / count.total) * 100;
    return (
        <div className={theme!.bar!}>
            {completed < 100 ? <ProgressBar completed={completed} /> : null}
            {displayDevBar ?
                <ul>
                    <li><Icon name="swap_vert"/> pending {pending}</li>
                    <li><Icon name="check_circle"/> success {success}</li>
                    <li><Icon name="error"/> error {error}</li>
                    <li><Icon name="functions"/> total {count.total}</li>
                </ul>
            : null}
        </div>
    );
}));
