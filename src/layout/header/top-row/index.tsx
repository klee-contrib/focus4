import * as React from "react";
import {findDOMNode} from "react-dom";

import {ScrollableContext} from "../../../components";
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
    static contextType = ScrollableContext;
    context!: React.ContextType<typeof ScrollableContext>;

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
                        <div>{this.props.children}</div>
                    </div>
                )}
            </Theme>
        );
    }
}
