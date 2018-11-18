import * as React from "react";

import {themr} from "../../theme";

import {LayoutContext} from "../types";

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
    static contextType = LayoutContext;
    context!: React.ContextType<typeof LayoutContext>;

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
