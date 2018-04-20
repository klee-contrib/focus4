import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";
import {themr} from "react-css-themr";
import {findDOMNode} from "react-dom";

import {LayoutProps, styles} from "./types";

/** Contenu du Layout. */
@observer
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
        const {children, theme} = this.props;
        return (
            <div className={theme!.content} style={{marginLeft: this.context.layout.menuWidth}}>
                {children}
            </div>
        );
    }
}

export default themr("layout", styles)(LayoutContent);
