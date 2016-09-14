import {autobind} from "core-decorators";
import * as React from "react";

import {FacetValue} from "../../../types";
export {FacetValue};

export interface FacetDataProps {
    data: FacetValue;
    dataKey: string;
    selectHandler: (dataKey: string, data: FacetValue) => void;
}

export class FacetData extends React.Component<FacetDataProps, void> {

    @autobind
    private selectFacetData() {
        const {data, dataKey, selectHandler} = this.props;
        selectHandler(dataKey, data);
    }

    render() {
        const {label, count} = this.props.data;
        return(
            <div data-focus="facet-data" onClick={this.selectFacetData}>
                {`${label} (${count})`}
            </div>
        );
    }
}
