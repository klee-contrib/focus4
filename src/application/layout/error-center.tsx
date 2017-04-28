import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import styles from "./__style__/error-center.css";
export type ErrorCenterStyle = Partial<typeof styles>;

export interface ErrorCenterProps {
    /** Déploie le centre d'erreur à l'initialisation. */
    areErrorsVisible?: boolean;
    /** Erreurs à ajouter à l'initilisation. */
    errors?: string[];
    /** Nombre d'erreurs affiché (par défaut : 3). */
    numberDisplayed?: number;
    /** Source des erreurs (par défaut : window). */
    source?: {onerror: (e: string) => void};
    /** Classes CSS. */
    theme?: ErrorCenterStyle;
}

/** Centre d'erreurs Javascript, pour afficher toutes les erreurs directement dans l'application. */
@themr("errorCenter", styles)
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
        const {numberDisplayed = 3, theme} = this.props;
        const errorLength = this.errors.length;
        return (
            <div className={theme!.center!}>
                <div className={theme!.counter!}>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "28px", padding: "15px 5px 5px 5px"}}>error</i>{errorLength}
                </div>
                <div className={theme!.actions!}>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "36px", padding: "10px"}} onClick={() => {window.location.reload(); }}>refresh</i>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "36px", padding: "10px"}} onClick={this.toggleVisible}>{`keyboard_arrow_${this.areErrorsVisible ? "down" : "up"}`}</i>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "36px", padding: "10px"}} onClick={() => this.errors = []}>delete</i>
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
        return 0 < this.errors.length ? this.renderErrors() : null;
    }
}
