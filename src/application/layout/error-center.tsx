import {autobind} from "core-decorators";
import i18n from "i18next";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Icon from "focus-components/icon";

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
        const icon = (name: string) => {
            const pre = `${i18nPrefix}.icons.errorCenter.${name}`;
            return {
                name: i18n.t(`${pre}.name`),
                library: i18n.t(`${pre}.library`),
                style: {style: {cursor: "pointer", fontSize: "36px", padding: "10px"}}
            };
        };
        return (
            <div className={theme!.center!}>
                <div className={theme!.counter!}>
                    <Icon {...icon("error")} style={{style: {cursor: "pointer", fontSize: "28px", padding: "15px 5px 5px 5px"}}} />{errorLength}
                </div>
                <div className={theme!.actions!}>
                    <Icon {...icon("refresh")} onClick={() => {window.location.reload(); }} />
                    <Icon {...icon(this.areErrorsVisible ? "close" : "open")} onClick={this.toggleVisible} />
                    <Icon {...icon("clear")} onClick={() => this.errors = []} />
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
