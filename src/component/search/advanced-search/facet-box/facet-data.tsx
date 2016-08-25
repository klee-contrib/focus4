import * as React from "react";
import {autobind} from "core-decorators";
import {FacetValue} from "../../../../search/search-action/types";
export {FacetValue};

export interface FacetDataProps {
    data: FacetValue;
    dataKey: string;
    selectHandler: (dataKey: string, data: FacetValue) => void;
}

export class FacetData extends React.Component<FacetDataProps, {}> {

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
