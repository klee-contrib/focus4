import {useObserver} from "mobx-react-lite";
import * as React from "react";
import {FontIcon} from "react-toolbox/lib/font_icon";
import {ProgressBar, ProgressBarTheme} from "react-toolbox/lib/progress_bar";

import {getIcon} from "@focus4/components";
import {requestStore} from "@focus4/core";
import {useTheme} from "@focus4/styling";

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
export function LoadingBar({i18nPrefix = "focus", progressBarType, theme: pTheme, displayDevBar}: LoadingBarProps) {
    const theme = useTheme("loadingBar", styles, pTheme);
    return useObserver(() => {
        const {count} = requestStore;
        const completed = +((count.total - count.pending) / count.total) * 100;
        return (
            <div className={theme.bar}>
                {completed < 100 ? <ProgressBar type={progressBarType} theme={theme} /> : null}
                {displayDevBar ? (
                    <ul>
                        <li>
                            <FontIcon>{getIcon(`${i18nPrefix}.icons.loadingBar.pending`)}</FontIcon> pending{" "}
                            {count.pending}
                        </li>
                        <li>
                            <FontIcon>{getIcon(`${i18nPrefix}.icons.loadingBar.success`)}</FontIcon> success{" "}
                            {count.success}
                        </li>
                        <li>
                            <FontIcon>{getIcon(`${i18nPrefix}.icons.loadingBar.error`)}</FontIcon> error {count.error}
                        </li>
                        <li>
                            <FontIcon>{getIcon(`${i18nPrefix}.icons.loadingBar.total`)}</FontIcon> total {count.total}
                        </li>
                    </ul>
                ) : null}
            </div>
        );
    });
}
