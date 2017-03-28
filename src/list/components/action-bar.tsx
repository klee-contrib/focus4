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

import * as styles from "./style/action-bar.css";
export type ActionBarStyle = Partial<typeof styles>;

export interface ActionBarProps {
    classNames?: ActionBarStyle;
    groupableColumnList?: {[column: string]: string};
    groupLabelPrefix?: string;
    hasSelection?: boolean;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    operationList?: DropdownItem[];
    store: ListStoreBase<any>;
}

@injectStyle("actionBar")
@observer
@autobind
export class ActionBar extends React.Component<ActionBarProps, void> {

    private getSelectionButton() {
        const {hasSelection, store} = this.props;
        if (hasSelection) {
            return <Button shape="icon" icon={this.getSelectionObjectIcon()} handleOnClick={store.toggleAll} />;
        } else {
            return null;
        }
    }

    private getSortButton() {
        const {orderableColumnList, store} = this.props;
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
        const {groupLabelPrefix = "", groupableColumnList, store} = this.props;
        if (groupableColumnList) {
            const groupOperationList = reduce(groupableColumnList, (operationList, label, key) => {
                operationList.push({
                    action: () => store.groupingKey = key,
                    label: i18n.t(groupLabelPrefix + label),
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
        const {classNames, operationList} = this.props;
        return (
            <div className={`${styles.actionBar} ${classNames!.actionBar}`}>
                <div className={`${styles.buttons} ${classNames!.buttons}`}>
                    {this.getSelectionButton()}
                    {this.getSortButton()}
                    {this.getGroupButton()}
                </div>
                {operationList && operationList.length ?
                    <div className={`${styles.contextualActions} ${classNames!.contextualActions}`}>
                        <ContextualActions operationList={operationList}/>
                    </div>
                : null}
            </div>
        );
    }
}

function getSelectedStyle(currentKey: string, selectedKey?: string) {
    return currentKey === selectedKey ? " selected " : "";
}
