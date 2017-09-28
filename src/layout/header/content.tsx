import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {HeaderProps, styles} from "./types";

/** Contenu du header. n'est affiché que si le header est déplié. */
@observer
export class HeaderContent extends React.Component<HeaderProps, void> {

    static contextTypes = {layout: React.PropTypes.object};
    context: {layout: {menuWidth: number}};

    render() {
        const {children, theme} = this.props;
        return (
            <div className={theme!.content} style={{marginLeft: this.context.layout.menuWidth}}>
                {children}
            </div>
        );
    }
}

export default themr("header", styles)(HeaderContent);
