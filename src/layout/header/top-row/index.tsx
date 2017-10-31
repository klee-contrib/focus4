import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";
import {themr} from "react-css-themr";

import styles from "../__style__/header.css";

export {default as HeaderBarLeft} from "./bar-left";
export {default as HeaderBarRight} from "./bar-right";
export {default as HeaderSummary} from "./summary";

/** Props du HeaderBarRight. */
export interface HeaderTopRowProps {
    children?: React.ReactNode;
    theme?: {
        topRow?: string;
    };
}

/** Barre du haut dans le header. */
@observer
export class HeaderTopRow extends React.Component<HeaderTopRowProps, void> {

    static contextTypes = {layout: PropTypes.object};
    context: {layout: {menuWidth: number}};

    render() {
        const {children, theme} = this.props;
        return (
            <div className={theme!.topRow}>
                <div style={{marginLeft: this.context.layout.menuWidth}}>
                    {children}
                </div>
            </div>
        );
    }
}

export default themr("header", styles)(HeaderTopRow);
