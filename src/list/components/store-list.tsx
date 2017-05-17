import {autobind} from "core-decorators";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ListStore} from "../store";
import {MiniListStore} from "../store-base";
import {LineWrapper} from "./line";
import {ListWithoutStyle} from "./list";

import * as styles from "./__style__/list.css";

export interface StoreListProps<T> {
    hasSelection?: boolean;
    selectionnableInitializer?: (data?: T) => boolean;
    store: MiniListStore<T>;
}

@themr("list", styles)
@autobind
@observer
export class StoreList<T, P extends {data?: T}> extends ListWithoutStyle<T, P, StoreListProps<T>> {

    @computed
    protected get data() {
        const data = this.props.data || (this.props.store as ListStore<T>).dataList;
        if (!data) {
            throw new Error("`props.data` doit être renseigné pour un usage avec un `SearchStore`");
        }
        return data;
    }

    @computed
    protected get hasMoreData() {
        const {store} = this.props;
        if (this.maxElements) {
            return this.data.length > this.maxElements;
        } else {
            return store.totalCount > store.currentCount;
        }
    }

    protected getItems(Line: new() => LineWrapper<T, P>, Component: React.ComponentClass<P> | React.SFC<P>) {
        const {itemKey, lineTheme, hasSelection = false, selectionnableInitializer = () => true, lineProps, operationList, store} = this.props;
        return this.displayedData.map((item, idx) =>
            <Line
                key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                data={item}
                theme={lineTheme}
                mosaic={this.mosaic}
                hasSelection={hasSelection}
                LineComponent={Component}
                lineProps={lineProps}
                onLineClick={() => this.onLineClick(idx)}
                operationList={operationList}
                selectionnableInitializer={selectionnableInitializer}
                store={store}
            />
        );
    }

    protected handleShowMore() {
        if ((this.props.store as any).service) {
            (this.props.store as any).load(true);
        } else {
            super.handleShowMore();
        }
    }
}
