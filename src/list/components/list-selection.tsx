import {autobind} from "core-decorators";
import {t as translate} from "i18next";
import {omit} from "lodash";
import * as React from "react";

import * as defaults from "../../defaults";

import {LineSelectionProps, OperationListItem} from "./lines";
import {ListBase, ListBaseProps} from "./list-base";

export interface ListSelectionPropsBase<P extends LineSelectionProps<{}>> extends ListBaseProps<P> {
    /** Default: 'id' */
    idField?: string;
    /** Default: true */
    isSelection?: boolean;
    loader?: () => React.ReactElement<any>;
    onLineClick?: (...args: any[]) => void;
    onSelection?: (data?: {}, isSelected?: boolean, isInit?: boolean) => void;
    operationList?: OperationListItem[];
    /** Default: 'partial' */
    selectionStatus?: "none" | "partial" | "selected";
}

export interface ListSelectionState {
    items: {[key: string]: boolean};
};

export type ListSelectionProps<P extends LineSelectionProps<{}>> = ListSelectionPropsBase<P> & P;

@autobind
export class ListSelection extends ListBase<ListSelectionPropsBase<LineSelectionProps<{}>>, ListSelectionState> {

    constructor(props: ListSelectionProps<{data: {}}>) {
        super(props);
        this.state = {items: this.getItems(props, true)};
    }

    componentWillReceiveProps(props: ListSelectionProps<{data: {}}>) {
        this.setState({items: this.getItems(props)});
    }

    shouldComponentUpdate({selectionStatus = "partial"}: ListSelectionProps<{data: {}}>, {items}: ListSelectionState) {
        return items !== this.state.items || selectionStatus !== this.props.selectionStatus;
    }

    getItems({values, selectionStatus = "partial"}: ListSelectionProps<{data: {}}>, isInit?: boolean) {
        const items: {[key: string]: boolean} = {};
        if (values) {
            values.forEach(item => {
                if (isInit || selectionStatus !== "partial") {
                    items[JSON.stringify(item)] = selectionStatus === "selected";
                } else {
                    items[JSON.stringify(item)] = this.state.items[JSON.stringify(item)];
                }
            });
        }
        return items;
    }

    getSelectedItems() {
        const {items} = this.state;
        const selectedItems: {}[] = [];
        Object.keys(items).forEach(item => {
            if (items[item]) {
                selectedItems.push(JSON.parse(item));
            }
        });
        return selectedItems;
    }

    private handleLineSelection(item: {}, isSelected: boolean, isInit?: boolean) {
        const {items} = this.state;
        items[JSON.stringify(item)] = isSelected;

        this.setState({items}, () => {
            if (this.props.onSelection && !isInit) {
                this.props.onSelection(item, isSelected);
            }
        });
    }

    private renderLines() {
        const {LineComponent, idField = "id", operationList} = this.props;
        const otherProps = omit(this.props, "data", "LineComponent", "idField", "selectionStatus", "onSelection", "operationList");
        const {items} = this.state;

        return Object.keys(items).map((key, idx) => {
            const data = JSON.parse(key);
            return (
                <LineComponent
                    data={data}
                    isSelected={items[key]}
                    key={data[idField] || idx}
                    onSelection={this.handleLineSelection}
                    operationList={operationList || []}
                    {...otherProps}
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
