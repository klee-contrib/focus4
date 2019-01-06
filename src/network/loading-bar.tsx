import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {FontIcon} from "react-toolbox/lib/font_icon";
import {ProgressBar, ProgressBarTheme} from "react-toolbox/lib/progress_bar";

import {getIcon} from "../components";

import {requestStore} from "./store";

import * as styles from "./__style__/loading-bar.css";

export type LoadingBarStyle = Partial<typeof styles> & ProgressBarTheme;

export interface LoadingBarProps {
    /** Affiche la barre de dev qui montre l'état du RequestStore. */
    displayDevBar?: boolean;
    /** Pour les icônes. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Type de la ProgressBar. Par défaut : "linear". */
    progressBarType?: "linear" | "circular";
    /** CSS. */
    theme?: LoadingBarStyle;
}

/** Composant standard pour afficher une barre de chargement sur l'état des requêtes en cours. */
export const LoadingBar = observer(({i18nPrefix = "focus", progressBarType, theme, displayDevBar}: LoadingBarProps) => {
    const {count, error, pending, success} = requestStore;
    const completed = +((count.total - count.pending) / count.total) * 100;
    return (
        <div className={theme!.bar}>
            {completed < 100 ? <ProgressBar type={progressBarType} theme={theme} /> : null}
            {displayDevBar ? (
                <ul>
                    <li>
                        <FontIcon>{getIcon(`${i18nPrefix}.icons.loadingBar.pending`)}</FontIcon> pending {pending}
                    </li>
                    <li>
                        <FontIcon>{getIcon(`${i18nPrefix}.icons.loadingBar.success`)}</FontIcon> success {success}
                    </li>
                    <li>
                        <FontIcon>{getIcon(`${i18nPrefix}.icons.loadingBar.error`)}</FontIcon> error {error}
                    </li>
                    <li>
                        <FontIcon>{getIcon(`${i18nPrefix}.icons.loadingBar.total`)}</FontIcon> total {count.total}
                    </li>
                </ul>
            ) : null}
        </div>
    );
});

export default themr("loadingBar", styles)(LoadingBar);
