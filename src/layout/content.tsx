import * as PropTypes from "prop-types";
import * as React from "react";
import {findDOMNode} from "react-dom";

import {LayoutProps, Theme} from "./types";

/** Contenu du Layout. */
export class LayoutContent extends React.Component<LayoutProps> {

    static contextTypes = {layout: PropTypes.object};
    context!: {
        layout: {
            contentPaddingTop: number,
            menuWidth: number
        }
    };

    componentDidMount() {
        const paddingTop = window.getComputedStyle(findDOMNode(this) as Element).paddingTop;
        this.context.layout.contentPaddingTop = paddingTop && paddingTop.endsWith("px") && +paddingTop.replace("px", "") || 0;
    }

    render() {
        return (
            <Theme theme={this.props.theme}>
                {theme =>
                    <div className={theme.content} style={{marginLeft: this.context.layout.menuWidth}}>
                        {this.props.children}
                    </div>
                }
            </Theme>
        );
    }
}
