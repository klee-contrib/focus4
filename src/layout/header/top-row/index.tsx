import * as PropTypes from "prop-types";
import * as React from "react";
import {findDOMNode} from "react-dom";

import {themr} from "../../../theme";

import * as styles from "../__style__/header.css";
const Theme = themr("header", styles);

export {HeaderBarLeft} from "./bar-left";
export {HeaderBarRight} from "./bar-right";
export {HeaderSummary} from "./summary";

/** Props du HeaderBarRight. */
export interface HeaderTopRowProps {
    children?: React.ReactNode;
    theme?: {
        topRow?: string;
    };
}

/** Barre du haut dans le header. */
export class HeaderTopRow extends React.Component<HeaderTopRowProps> {
    static contextTypes = {
        header: PropTypes.object,
        layout: PropTypes.object
    };

    context!: {
        header: {topRowHeight: number};
        layout: {menuWidth: number};
    };

    componentDidMount() {
        this.context.header.topRowHeight = (findDOMNode(this) as Element).clientHeight;
    }

    componentDidUpdate() {
        this.context.header.topRowHeight = (findDOMNode(this) as Element).clientHeight;
    }

    render() {
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <div className={theme.topRow}>
                        <div style={{marginLeft: this.context.layout.menuWidth}}>{this.props.children}</div>
                    </div>
                )}
            </Theme>
        );
    }
}
