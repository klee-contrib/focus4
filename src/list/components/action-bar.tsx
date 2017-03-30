import {autobind} from "core-decorators";
import i18n from "i18next";
import {reduce} from "lodash";
import {action} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";

import {injectStyle} from "../../theming";

import {ListStoreBase} from "../store-base";
import {ContextualActions} from "./contextual-actions";
import {OperationListItem} from "./line";

import * as styles from "./style/action-bar.css";

export type ActionBarStyle = Partial<typeof styles>;

export interface ActionBarProps {
    classNames?: ActionBarStyle;
    groupableColumnList?: {[column: string]: string};
    hasSelection?: boolean;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    operationList?: OperationListItem[];
    store: ListStoreBase<any>;
}

@injectStyle("actionBar")
@observer
@autobind
export class ActionBar extends React.Component<ActionBarProps, void> {

    private getSelectionButton() {
        const {classNames, hasSelection, store} = this.props;
        const {length} = store.selectedList;
        if (hasSelection) {
            return (
                <div className={`${styles.selectionText} ${classNames!.selectionText || ""}`}>
                    <Button shape="icon" icon={this.getSelectionObjectIcon()} handleOnClick={store.toggleAll} />
                    {length ? <strong>{`${length} ${i18n.t(length === 1 ? "list.actionBar.selectedItem" : "list.actionBar.selectedItems")}`}</strong> : null}
                </div>
            );
        } else {
            return null;
        }
    }

    private getSortButton() {
        const {orderableColumnList, store} = this.props;

        if (store.selectedItems.size) {
            return null;
        }

        if (orderableColumnList) {
            const orderOperationList: DropdownItem[] = [];
            for (const key in orderableColumnList) {
                const description = orderableColumnList[key];
                orderOperationList.push({
                    action: action(() => {
                        store.sortBy = description.key;
                        store.sortAsc = description.order;
                    }),
                    label: description.label,
                    style: getSelectedStyle(description.key + description.order, store.sortBy + (store.sortAsc ? "asc" : "desc"))
                });
            }

            const currentItem = orderableColumnList.find(o => o.key === store.sortBy && o.order === store.sortAsc);
            return (
                <Dropdown
                    button={{
                        label: currentItem ? `${i18n.t("list.actionBar.sortBy")} ${currentItem.label}` : "list.actionBar.sort",
                        shape: null
                    }}
                    operations={orderOperationList}
                />
            );
        }

        return null;
    }

    private getGroupButton() {
        const {groupableColumnList, store} = this.props;

        if (store.selectedItems.size) {
            return null;
        }

        if (groupableColumnList) {
            const groupOperationList = reduce(groupableColumnList, (operationList, label, key) => {
                operationList.push({
                    action: () => store.groupingKey = key,
                    label: i18n.t(label),
                    style: getSelectedStyle(key, store.groupingKey)
                });
                return operationList;
            }, [] as DropdownItem[]);

            if (store.groupingKey) {
                return <Button onClick={() => store.groupingKey = undefined} label={i18n.t("list.actionBar.ungroup")} shape={null} />;
            } else  {
                return <Dropdown button={{label: "list.actionBar.group", shape: null}} operations={groupOperationList} />;
            }
        } else {
            return null;
        }
    }

    private getSelectionObjectIcon() {
        switch (this.props.store.selectionStatus) {
            case "none": return "check_box_outline_blank";
            case "selected": return "check_box";
            default: return "indeterminate_check_box";
        }
    }

    render() {
        const {classNames, operationList, store} = this.props;
        return (
            <div className={`${styles.actionBar} ${classNames!.actionBar || ""}`}>
                <div className={`${styles.buttons} ${classNames!.buttons || ""}`}>
                    {this.getSelectionButton()}
                    {this.getSortButton()}
                    {this.getGroupButton()}
                </div>
                {store.selectedItems.size && operationList && operationList.length ?
                    <ContextualActions operationList={operationList} operationParam={store.selectedList} />
                : null}
            </div>
        );
    }
}

function getSelectedStyle(currentKey: string, selectedKey?: string) {
    return currentKey === selectedKey ? " selected " : "";
}
