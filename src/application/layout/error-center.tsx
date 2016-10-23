import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {actions, center, counter, stack} from "./style/error-center.css";

export interface ErrorCenterProps {
    areErrorsVisible?: boolean;
    errors?: string[];
    numberDisplayed?: number;
    source?: {onerror: (e: string) => void};
}

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
        const {numberDisplayed = 3} = this.props;
        const errorLength = this.errors.length;
        return (
            <div className={center}>
                <div className={counter}>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "28px", padding: "15px 5px 5px 5px"}}>error</i>{errorLength}
                </div>
                <div className={actions}>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "36px", padding: "10px"}} onClick={() => {window.location.reload(); }}>refresh</i>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "36px", padding: "10px"}} onClick={this.toggleVisible}>{`keyboard_arrow_${this.areErrorsVisible ? "down" : "up"}`}</i>
                    <i className="material-icons" style={{cursor: "pointer", fontSize: "36px", padding: "10px"}} onClick={() => this.errors = []}>delete</i>
                </div>
                <ul className={stack}>
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
