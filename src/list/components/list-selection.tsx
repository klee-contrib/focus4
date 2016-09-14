import {autobind} from "core-decorators";
import {omit} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import * as defaults from "../../defaults";
import {translate} from "../../translation";

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

export type ListSelectionProps<P extends LineSelectionProps<{}>> = ListSelectionPropsBase<P> & P;

@autobind
@observer
export class ListSelection extends ListBase<ListSelectionPropsBase<LineSelectionProps<{}>>, void> {

    @observable items = this.getItems(this.props as ListSelectionProps< {data: {}} >, true);

    componentWillReceiveProps(props: ListSelectionProps<{}>) {
        this.items = this.getItems(props, true);
    }

    getItems({values, selectionStatus = "partial"}: ListSelectionProps<{}>, isInit?: boolean) {
        const items: {[key: string]: boolean} = {};
        if (values) {
            values.forEach(item => {
                if (isInit || selectionStatus !== "partial") {
                    items[JSON.stringify(item)] = selectionStatus === "selected";
                } else {
                    items[JSON.stringify(item)] = this.items[JSON.stringify(item)];
                }
            });
        }
        return items;
    }

    getSelectedItems() {
        const selectedItems: {}[] = [];
        Object.keys(this.items).forEach(item => {
            if (this.items[item]) {
                selectedItems.push(JSON.parse(item));
            }
        });
        return selectedItems;
    }

    private handleLineSelection(item: {}, isSelected: boolean, isInit?: boolean) {
        this.items[JSON.stringify(item)] = isSelected;
        if (this.props.onSelection && !isInit) {
            this.props.onSelection(item, isSelected);
        }
    }

    private renderLines() {
        const {LineComponent, idField = "id", operationList} = this.props;
        const otherProps = omit(this.props, "data", "LineComponent", "idField", "selectionStatus", "onSelection", "operationList");

        return Object.keys(this.items).map((key, idx) => {
            const data = JSON.parse(key);
            return (
                <LineComponent
                    data={data}
                    isSelected={this.items[key]}
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
