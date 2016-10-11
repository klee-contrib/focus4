import {autobind} from "core-decorators";
import {observable, asMap, isObservableArray} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import * as defaults from "../../defaults";
import {translate} from "../../translation";

import {LineSelectionProps, OperationListItem} from "./lines";
import {ListBase, ListBaseProps} from "./list-base";

export interface ListSelectionProps<T, P extends LineSelectionProps<T>> extends ListBaseProps<T, P> {
    /** Default: data => data.id.value || data.id */
    idField?: (data: T) => string;
    /** Default: true */
    isSelection?: boolean;
    loader?: () => React.ReactElement<any>;
    onLineClick?: (...args: any[]) => void;
    onSelection?: (data?: {}, isSelected?: boolean, isInit?: boolean) => void;
    operationList?: OperationListItem[];
    /** Default: 'partial' */
    selectionStatus?: "none" | "partial" | "selected";
}

@autobind
@observer
export class ListSelection<T, P extends LineSelectionProps<T>> extends ListBase<T, ListSelectionProps<T, P>> {

    idField = this.props.idField || ((data: any) => (data.id.value || data.id).toString());

    @observable private items = asMap(this.props.data && this.props.data.reduce< {[key: string]: {item: {}, selected: boolean}} >((items, item) => {
        items[this.idField(item)] = {item, selected: this.props.selectionStatus === "selected"};
        return items;
    }, {}) || {});

    /** Instancie une version typée du ListSelection. */
    static create<T, L extends LineSelectionProps<T>>(props: ListSelectionProps<T, L>) {
        const List = ListSelection as any;
        return <List {...props} />;
    }

    componentWillReact() {
        if (isObservableArray(this.props.data)) {
            this.updateItems(this.props);
        }
    }

    componentWillReceiveProps(props: ListSelectionProps<T, P>) {
        if (!isObservableArray(this.props.data)) {
            this.updateItems(props);
        }
    }

    updateItems({selectionStatus, data}: ListSelectionProps<T, P>) {
        for (const item of data) {
            const key = this.idField(item);
            if (!(this.items.has(key) && selectionStatus === "partial")) {
                this.items.set(key, {item, selected: this.props.selectionStatus === "selected"});
            }
        }
    }

    getSelectedItems() {
        const selectedItems: {}[] = [];
        this.items.forEach((item, key) => {
            if (item.selected) {
                selectedItems.push(item.item);
            }
        });
        return selectedItems;
    }

    private handleLineSelection(item: T, selected: boolean, isInit?: boolean) {
        this.items.set(this.idField(item), {item, selected});
        if (this.props.onSelection && !isInit) {
            this.props.onSelection(item, selected);
        }
    }

    private renderLines() {
        const {LineComponent, operationList, data, lineProps} = this.props;
        return data.map(value => {
            return (
                <LineComponent
                    data={value}
                    isSelected={this.items.get(this.idField(value)).selected}
                    key={this.idField(value)}
                    onSelection={this.handleLineSelection}
                    operationList={operationList || []}
                    {...lineProps}
                />
            );
        });
    }

    private renderLoading() {
        const {isLoading, loader} = this.props;
        if (isLoading) {
            if (loader) {
                return loader();
            }
            return (
                <li className="sl-loading">{translate("list.loading")} ...</li>
            );
        } else {
            return null;
        }
    }

    private renderManualFetch() {
        const {isManualFetch, hasMoreData} = this.props;
        const {Button} = defaults;
        if (!Button) {
            throw new Error("Button n'a pas été défini.");
        }
        if (isManualFetch && hasMoreData) {
            const style = {className: "primary"};
            return (
                <li className="sl-button">
                    <Button
                        handleOnClick={this.handleShowMore}
                        label="list.button.showMore"
                        style={style}
                        type="button"
                    />
                </li>
            );
        } else {
            return null;
        }
    }

    render() {
        const {isSelection = true} = this.props;
        return (
            <ul data-focus="selection-list" data-selection={isSelection}>
                {this.renderLines()}
                {this.renderLoading()}
                {this.renderManualFetch()}
            </ul>
        );
    }
}
