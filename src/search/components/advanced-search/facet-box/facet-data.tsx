import {autobind} from "core-decorators";
import * as React from "react";

import {FacetItem} from "../../../types";

export interface FacetDataProps {
    data: FacetItem;
    dataKey: string;
    selectHandler: (dataKey: string) => void;
}

export class FacetData extends React.Component<FacetDataProps, void> {

    @autobind
    private selectFacetData() {
        const {dataKey, selectHandler} = this.props;
        selectHandler(dataKey);
    }

    render() {
        const {label, count} = this.props.data;
        return (
            <div onClick={this.selectFacetData}>
                {`${label} (${count})`}
            </div>
        );
    }
}
