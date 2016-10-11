import {observer} from "mobx-react";
import * as React from "react";

import {ReactComponent} from "../defaults";

import {ListStore} from "./store";

export interface ListComponentProps<T> {
    values: T[];
    isManualFetch?: boolean;
}

export interface ListPageProps<T, L extends ListComponentProps<T>> {
    ListComponent: ReactComponent<L>;
    listProps: L;
    store: ListStore<T>;
}

@observer
export class ListPage<T, L extends ListComponentProps<T>> extends React.Component<ListPageProps<T, L>, void> {

    /** Instancie une version typée du ListPage. */
    static create<T, L extends ListComponentProps<T>>(props: ListPageProps<T, L>) {
        const List = ListPage as any;
        return <List {...props} />;
    }

    componentWillMount() {
       this.props.store.load(false);
    }

    render() {
        let {dataList, totalCount, load} = this.props.store;
        const listProps = {ref: "list", values: dataList, fetchNextPage: () => load(false), hasMoreData: dataList.length < totalCount};
        const {ListComponent} = this.props;
        return <ListComponent {...this.props.listProps} {...listProps} />;
    }
}
