import {observer} from "mobx-react";
import * as React from "react";

import {LayoutContext} from "./types";

/** Footer du Layout. */
@observer
export class LayoutFooter extends React.Component {
    static contextType = LayoutContext;
    context!: React.ContextType<typeof LayoutContext>;

    render() {
        return <footer style={{marginLeft: this.context.layout.menuWidth}}>{this.props.children}</footer>;
    }
}
