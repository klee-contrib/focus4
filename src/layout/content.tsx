import * as React from "react";
import {findDOMNode} from "react-dom";

import {LayoutContext, LayoutProps, Theme} from "./types";

/** Contenu du Layout. */
export class LayoutContent extends React.Component<LayoutProps> {
    static contextType = LayoutContext;
    context!: React.ContextType<typeof LayoutContext>;

    componentDidMount() {
        const paddingTop = window.getComputedStyle(findDOMNode(this) as Element).paddingTop;
        this.context.layout.contentPaddingTop =
            (paddingTop && paddingTop.endsWith("px") && +paddingTop.replace("px", "")) || 0;
    }

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
