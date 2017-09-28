import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {LayoutProps, styles} from "./types";

/** Contenu du Layout. */
@observer
export class LayoutContent extends React.Component<LayoutProps, void> {

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

export default themr("layout", styles)(LayoutContent);
