import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";

/** Footer du Layout. */
@observer
export class LayoutFooter extends React.Component<{}, void> {

    static contextTypes = {layout: PropTypes.object};
    context!: {layout: {menuWidth: number}};

    render() {
        return (
            <footer style={{marginLeft: this.context.layout.menuWidth}}>
                {this.props.children}
            </footer>
        );
    }
}

export default LayoutFooter;
