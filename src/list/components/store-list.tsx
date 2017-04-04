import {autobind} from "core-decorators";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {injectStyle} from "../../theming";

import {ListStore} from "../store";
import {ListStoreBase} from "../store-base";
import {LineWrapper} from "./line";
import {ListWithoutStyle} from "./list";

export interface StoreListProps<T> {
    hasSelection?: boolean;
    selectionnableInitializer?: (data?: T) => boolean;
    store: ListStoreBase<T>;
}

@injectStyle("list")
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

    protected renderLines() {
        const {itemKey, lineClassNames, LineComponent, hasSelection = false, selectionnableInitializer = () => true, lineProps, operationList, store, extraItems = [], extraItemsPosition = "after"} = this.props;
        const Line = LineWrapper as new() => LineWrapper<T, P>;

        const items = this.displayedData.map((item, idx) =>
            <Line
                key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                data={item}
                classNames={lineClassNames}
                hasSelection={hasSelection}
                LineComponent={LineComponent}
                lineProps={lineProps}
                operationList={operationList}
                selectionnableInitializer={selectionnableInitializer}
                store={store}
            />
        );

        if (extraItemsPosition === "after") {
            return [...items, ...extraItems];
        } else {
            return [...extraItems, ...items];
        }
    }

    protected handleShowMore() {
        if ((this.props.store as ListStore<T>).service) {
            (this.props.store as ListStore<T>).load(true);
        } else {
            super.handleShowMore();
        }
    }
}
