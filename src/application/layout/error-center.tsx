import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle} from "../../theming";

import style from "./__style__/error-center.css";
export type ErrorCenterStyle = Partial<typeof style>;

export interface ErrorCenterProps {
    /** Déploie le centre d'erreur à l'initialisation. */
    areErrorsVisible?: boolean;
    /** Classes CSS. */
    classNames?: ErrorCenterStyle;
    /** Erreurs à ajouter à l'initilisation. */
    errors?: string[];
    /** Nombre d'erreurs affiché (par défaut : 3). */
    numberDisplayed?: number;
    /** Source des erreurs (par défaut : window). */
    source?: {onerror: (e: string) => void};
}

/** Centre d'erreurs Javascript, pour afficher toutes les erreurs directement dans l'application. */
@injectStyle("errorCenter")
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
        const {numberDisplayed = 3, classNames} = this.props;
        const errorLength = this.errors.length;
        return (
            <div className={`${style.center} ${classNames!.center || ""}`}>
                <div className={`${style.counter} ${classNames!.counter || ""}`}>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "28px", padding: "15px 5px 5px 5px"}}>error</i>{errorLength}
                </div>
                <div className={`${style.actions} ${classNames!.actions || ""}`}>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "36px", padding: "10px"}} onClick={() => {window.location.reload(); }}>refresh</i>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "36px", padding: "10px"}} onClick={this.toggleVisible}>{`keyboard_arrow_${this.areErrorsVisible ? "down" : "up"}`}</i>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "36px", padding: "10px"}} onClick={() => this.errors = []}>delete</i>
                </div>
                <ul className={`${style.stack} ${classNames!.stack || ""}`}>
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
