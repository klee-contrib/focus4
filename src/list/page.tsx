import {omit} from "lodash";
import {observer} from "mobx-react";
import * as React from "react";

import {ReactComponent} from "../defaults";

import {ListTable} from "./components/list-table";
import {ListStore} from "./store";

export interface ListPageProps<T> {
    ListComponent?: ReactComponent<any>;
    store: ListStore<T>;
}

@observer
export class ListPage extends React.Component<ListPageProps<{}>, {}> {

    componentWillMount() {
       this.props.store.load(false);
    }

    render() {
        let {dataList, totalCount, load} = this.props.store;
        const listProps = Object.assign({},
            omit(this.props, "store", "ListComponent"),
            {data: dataList, fetchNextPage: () => load(false), hasMoreData: dataList.length < totalCount});
        const {ListComponent = ListTable} = this.props;

        return <ListComponent {...listProps} ref="list" />;
    }
}
