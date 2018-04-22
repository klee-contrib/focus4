import * as PropTypes from "prop-types";
import * as React from "react";

import {themr} from "../../theme";

import * as styles from "./__style__/header.css";
const Theme = themr("header", styles);

/** Props du HeaderContent. */
export interface HeaderContentProps {
    children?: React.ReactNode;
    theme?: {
        content?: string;
    };
}

/** Contenu du header. n'est affiché que si le header est déplié. */
export class HeaderContent extends React.Component<HeaderContentProps> {
    static contextTypes = {layout: PropTypes.object};
    context!: {layout: {menuWidth: number}};

    render() {
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <div className={theme.content} style={{marginLeft: this.context.layout.menuWidth}}>
                        {this.props.children}
                    </div>
                )}
            </Theme>
        );
    }
}
