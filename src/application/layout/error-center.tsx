import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {IconButton} from "react-toolbox/lib/button";
import {FontIcon} from "react-toolbox/lib/font_icon";

import {getIcon} from "../../components";

import styles from "./__style__/error-center.css";

export type ErrorCenterStyle = Partial<typeof styles>;

export interface ErrorCenterProps {
    /** Déploie le centre d'erreur à l'initialisation. */
    areErrorsVisible?: boolean;
    /** Erreurs à ajouter à l'initilisation. */
    errors?: string[];
    /** Préfixe i18n pour les icônes. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre d'erreurs affiché (par défaut : 3). */
    numberDisplayed?: number;
    /** Source des erreurs (par défaut : window). */
    source?: {onerror: (e: string) => void};
    /** Classes CSS. */
    theme?: ErrorCenterStyle;
}

/** Centre d'erreurs Javascript, pour afficher toutes les erreurs directement dans l'application. */
@autobind
@observer
export class ErrorCenter extends React.Component<ErrorCenterProps, void> {

    @observable areErrorsVisible = this.props.areErrorsVisible || false;
    @observable errors = this.props.errors || [];

    // Ajoute un listener sur la source pour enregistrer les erreurs.
    componentWillMount() {
        (this.props.source || window).onerror = (e => this.errors.push(e));
    }

    toggleVisible() {
        this.areErrorsVisible = !this.areErrorsVisible;
    }

    renderErrors() {
        const {numberDisplayed = 3, i18nPrefix = "focus", theme} = this.props;
        const errorLength = this.errors.length;
        return (
            <div className={theme!.center!}>
                <div className={theme!.counter!}>
                    <FontIcon className={theme!.icon!}>{getIcon(`${i18nPrefix}.icons.errorCenter.error`)}</FontIcon>{errorLength}
                </div>
                <div className={theme!.actions!}>
                    <IconButton
                        icon={getIcon(`${i18nPrefix}.icons.errorCenter.refresh`)}
                        onClick={() => { window.location.reload(); }}
                        theme={{icon: theme!.icon!, toggle: theme!.toggle!}}
                    />
                    <IconButton
                        icon={getIcon(`${i18nPrefix}.icons.errorCenter.${this.areErrorsVisible ? "close" : "open"}`)}
                        onClick={this.toggleVisible}
                        theme={{icon: theme!.icon!, toggle: theme!.toggle!}}
                    />
                    <IconButton
                        icon={getIcon(`${i18nPrefix}.icons.errorCenter.clear`)}
                        onClick={() => this.errors = []}
                        theme={{icon: theme!.icon!, toggle: theme!.toggle!}}
                    />
                </div>
                <ul className={theme!.stack!}>
                    {this.areErrorsVisible ?
                        this.errors.slice(errorLength - numberDisplayed, errorLength).map((e, i) => <li key={i}>{e}</li>)
                    : null}
                </ul>
            </div>
        );
    }

    render() {
        return this.errors.length > 0 ? this.renderErrors() : null;
    }
}

export default themr("errorCenter", styles)(ErrorCenter);
