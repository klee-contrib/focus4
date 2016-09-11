import {autobind} from "core-decorators";
import {omit} from "lodash";
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

export interface MemoryListState {
    page?: number;
    maxElements?: number;
}

@autobind
export class MemoryList extends React.Component<MemoryListProps<BaseListProps>, MemoryListState> {

    constructor(props: MemoryListProps<BaseListProps>) {
        super(props);
        this.state = {
            page: 1,
            maxElements: this.props.perPage || 5
        };
    }

    fetchNextPage() {
        let currentPage = this.state.page + 1;
        this.setState({
            page: currentPage,
            maxElements: (this.props.perPage || 5) * currentPage
        });
    }

    getDataToUse() {
        const {values} = this.props;
        if (!values) {
            return [];
        }
        return values.slice(0, this.state.maxElements);
    }

    render() {
        const {values = [], ListComponent} = this.props;
        const hasMoreData = values.length > this.state.maxElements;
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
