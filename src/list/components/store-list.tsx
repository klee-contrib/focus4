import {autobind} from "core-decorators";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Checkbox from "focus-components/input-checkbox";

import {injectStyle} from "../../theming";

import {ListStore} from "../store";
import {ListStoreBase} from "../store-base";
import {LineProps} from "./line";
import {ListWithoutStyle} from "./list";

import * as styles from "./style/line.css";

export interface StoreListProps<T> {
    hasSelection?: boolean;
    selectionnableInitializer?: (data?: T) => boolean;
    store: ListStoreBase<T>;
}

function lineSelection(
    component: React.ReactElement<any>,
    isSelected: boolean,
    isSelectionnable: boolean,
    onSelection: () => void
) {
    return React.createElement(injectStyle("line", ({classNames}: {classNames: typeof styles}) => (
        <li className={`${styles.selection} ${classNames!.selection || ""}`}>
            {isSelectionnable ?
                <div className={`${styles.checkbox} ${classNames!.checkbox || ""} ${isSelected ? `${styles.selected} ${classNames!.selected || ""}` : `${styles.unselected} ${classNames!.unselected || ""}`}`}>
                    <Checkbox onChange={onSelection} value={isSelected} />
                </div>
            : null}
            {component}
        </li>
    )));
}

@injectStyle("list")
@autobind
@observer
export class StoreList<T, P extends LineProps<T>> extends ListWithoutStyle<T, P, StoreListProps<T>> {

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
        const {LineComponent, hasSelection = false, selectionnableInitializer = () => true, lineProps, store} = this.props;
        return this.displayedData.map((value, i) => lineSelection(
            <LineComponent
                key={i}
                data={value}
                {...lineProps}
            />,
            store.selectedItems.has(value),
            hasSelection && selectionnableInitializer(value),
            () => store.toggle(value)
        ));
    }

    protected handleShowMore() {
        if ((this.props.store as ListStore<T>).service) {
            (this.props.store as ListStore<T>).load(true);
        } else {
            super.handleShowMore();
        }
    }
}
