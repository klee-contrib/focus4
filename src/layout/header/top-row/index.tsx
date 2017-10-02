import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";
import {themr} from "react-css-themr";

import {HeaderProps, styles} from "../types";

export {default as HeaderBarLeft} from "./bar-left";
export {default as HeaderBarRight} from "./bar-right";
export {default as HeaderSummary} from "./summary";

/** Barre du haut dans le header. */
@observer
export class HeaderTopRow extends React.Component<HeaderProps, void> {

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
