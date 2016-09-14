import {autobind} from "core-decorators";
import {omit} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {ReactComponent} from "../../defaults";

export interface BaseListProps {
    ref?: string;
    values?: {[key: string]: any}[];
    fetchNextPage?: () => void;
    hasMoreData?: boolean;
    isManualFetch?: boolean;
    isSelection?: boolean;
}

export interface MemoryListProps<ListProps extends BaseListProps> extends BaseListProps {
    ListComponent: ReactComponent<ListProps>;
    /** Default: 5 */
    perPage?: number;
}

@autobind
@observer
export class MemoryList extends React.Component<MemoryListProps<BaseListProps>, void> {

    @observable page = 1;
    @observable maxElements = this.props.perPage || 5;

    fetchNextPage() {
        this.page = this.page + 1;
        this.maxElements = (this.props.perPage || 5) * this.page;
    }

    getDataToUse() {
        const {values} = this.props;
        if (!values) {
            return [];
        }
        return values.slice(0, this.maxElements);
    }

    render() {
        const {values = [], ListComponent} = this.props;
        const hasMoreData = values.length > this.maxElements;
        const childProps = omit(this.props, "data");
        const LC = ListComponent as React.ComponentClass<BaseListProps>;
        return (
            <LC
                ref="list"
                values={this.getDataToUse()}
                hasMoreData={hasMoreData}
                isSelection={false}
                isManualFetch={true}
                fetchNextPage={this.fetchNextPage}
                {...childProps}
            />
        );
    }
}
