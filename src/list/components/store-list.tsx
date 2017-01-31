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

interface LineSelectionProps<T, P extends LineProps<T>> {
    classNames?: Partial<typeof styles>;
    data: T;
    isSelection: boolean;
    LineComponent: ReactComponent<P>;
    lineProps?: P;
    selectionnableInitializer: (data: T) => boolean;
    store: ListStoreBase<T>;
}

@injectStyle("line")
@observer
class LineSelection<T, P extends LineProps<T>> extends React.Component<LineSelectionProps<T, P>, void> {

    @computed
    get isSelected() {
        return this.props.store.selectedItems.has(this.props.data);
    }

    onSelection = () => this.props.store.toggle(this.props.data);

    render() {
        const {LineComponent, data, lineProps, isSelection, selectionnableInitializer, classNames} = this.props;
        return (
            <li className={isSelection ? `${styles.selection} ${classNames!.selection || ""}` : undefined}>
                {isSelection && selectionnableInitializer(data) ?
                    <div className={`${styles.checkbox} ${classNames!.checkbox || ""} ${this.isSelected ? `${styles.selected} ${classNames!.selected || ""}` : `${styles.unselected} ${classNames!.unselected || ""}`}`}>
                        <Checkbox onChange={this.onSelection} rawInputValue={this.isSelected} />
                    </div>
                : null}
                <LineComponent data={data} {...lineProps} />
            </li>
        );
    }
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
        const Line = LineSelection as new() => LineSelection<T, P>;
        return this.displayedData.map((data, i) =>
            <Line
                key={i}
                classNames={lineProps && lineProps.classNames}
                data={data}
                isSelection={hasSelection}
                LineComponent={LineComponent}
                lineProps={lineProps}
                selectionnableInitializer={selectionnableInitializer}
                store={store}
            />
        );
    }

    protected handleShowMore() {
        if ((this.props.store as ListStore<T>).service) {
            (this.props.store as ListStore<T>).load(true);
        } else {
            super.handleShowMore();
        }
    }
}
