import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {ReactComponent} from "../../defaults";

export interface ListForProps {
    ref?: string;
    fetchNextPage?: () => void;
    hasMoreData?: boolean;
    isManualFetch?: boolean;
}

export interface CommonListProps<T> extends ListForProps {
    data: T[];
}

export interface MemoryListProps<T, P extends CommonListProps<T>> {
    ListComponent: ReactComponent<P>;
    data: T[];
    listProps: P;
    /** Default: 5 */
    perPage?: number;
}

@autobind
@observer
export class MemoryList<T, P extends CommonListProps<T>> extends React.Component<MemoryListProps<T, P>, void> {

    @observable page = 1;
    @observable maxElements = this.props.perPage || 5;

    /** Instancie une version typée du MemoryList. */
    static create<T, L extends CommonListProps<T>>(props: MemoryListProps<T, L>) {
        const List = MemoryList as any;
        return <List {...props} />;
    }

    fetchNextPage() {
        this.page = this.page + 1;
        this.maxElements = (this.props.perPage || 5) * this.page;
    }

    getDataToUse() {
        return this.props.data.slice(0, this.maxElements);
    }

    render() {
        const {data, ListComponent, listProps} = this.props;
        const hasMoreData = data.length > this.maxElements;
        return (
            <ListComponent
                ref="list"
                data={this.getDataToUse()}
                hasMoreData={hasMoreData}
                isManualFetch={true}
                fetchNextPage={this.fetchNextPage}
                {...listProps}
            />
        );
    }
}
