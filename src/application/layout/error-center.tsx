import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle} from "../../theming";

import style from "./style/error-center.css";
export type ErrorCenterStyle = Partial<typeof style>;

export interface ErrorCenterProps {
    areErrorsVisible?: boolean;
    classNames?: ErrorCenterStyle;
    errors?: string[];
    numberDisplayed?: number;
    source?: {onerror: (e: string) => void};
}

@injectStyle("errorCenter")
@autobind
@observer
export class ErrorCenter extends React.Component<ErrorCenterProps, void> {

    @observable areErrorsVisible = this.props.areErrorsVisible || false;
    @observable errors = this.props.errors || [];

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
