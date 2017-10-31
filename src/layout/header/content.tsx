import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";
import {themr} from "react-css-themr";

import styles from "./__style__/header.css";

/** Props du HeaderContent. */
export interface HeaderContentProps {
    children?: React.ReactNode;
    theme?: {
        content?: string;
    };
}

/** Contenu du header. n'est affiché que si le header est déplié. */
@observer
export class HeaderContent extends React.Component<HeaderContentProps, void> {

    static contextTypes = {layout: PropTypes.object};
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
