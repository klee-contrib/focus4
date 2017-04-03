import {autobind} from "core-decorators";
import i18n from "i18next";
import {isEmpty, reduce} from "lodash";
import {action, computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";
import InputText from "focus-components/input-text";

import {injectStyle} from "../../theming";

import {ListStoreBase} from "../store-base";
import {ContextualActions} from "./contextual-actions";
import {GroupOperationListItem} from "./line";

import * as styles from "./style/action-bar.css";

export type ActionBarStyle = Partial<typeof styles>;

export interface ActionBarProps {
    classNames?: ActionBarStyle;
    group?: {code: string, label: string, totalCount: number};
    groupableColumnList?: {[facet: string]: string};
    hasSearchBar?: boolean;
    hasSelection?: boolean;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    operationList?: GroupOperationListItem<{}>[];
    searchBarPlaceholder?: string;
    store: ListStoreBase<any>;
}

@injectStyle("actionBar")
@observer
@autobind
export class ActionBar extends React.Component<ActionBarProps, void> {

    @computed.struct
    get selectedList() {
        const {group, store} = this.props;
        if (!group) {
            return store.selectedList;
        } else {
            const list = store.getListByGroupCode(group.code);
            return list.filter(item => store.selectedItems.has(item));
        }
    }

    @computed
    get selectionStatus() {
        const {group, store} = this.props;
        if (!group) {
            return store.selectionStatus;
        } else {
            if (this.selectedList.length === 0) {
                return "none";
            } else if (this.selectedList.length === group.totalCount) {
                return "selected";
            } else {
                return "partial";
            }
        }
    }

    private getSelectionButton() {
        const {group, hasSelection, store} = this.props;
        if (hasSelection && (!store.groupingKey || group)) {
            return (
                <Button
                    shape="icon"
                    icon={this.getSelectionObjectIcon()}
                    handleOnClick={() => store.groupingKey && group ? store.toggleMany(store.getListByGroupCode(group!.code)) : store.toggleAll()}
                />
            );
        } else {
            return null;
        }
    }

    private getSortButton() {
        const {orderableColumnList, store} = this.props;

        if (!(store.selectedItems.size || store.groupingKey) && orderableColumnList) {
            const orderOperationList: DropdownItem[] = [];
            for (const key in orderableColumnList) {
                const description = orderableColumnList[key];
                orderOperationList.push({
                    action: action(() => {
                        store.sortBy = description.key;
                        store.sortAsc = description.order;
                    }),
                    label: description.label
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

        if (!store.selectedItems.size && groupableColumnList) {
            const groupOperationList = reduce(groupableColumnList, (operationList, label, key) => {
                operationList.push({
                    action: () => store.groupingKey = key,
                    label: i18n.t(label)
                });
                return operationList;
            }, [] as DropdownItem[]);

            if (!isEmpty(groupOperationList)) {
                return <Dropdown button={{label: "list.actionBar.group", shape: null}} operations={groupOperationList} />;
            }
        }

        return null;
    }

    private getSearchBar() {
        const {classNames, hasSearchBar, searchBarPlaceholder, store} = this.props;

        if (!store.selectedItems.size && hasSearchBar) {
            return (
                <div className={`${styles.searchBar} ${classNames!.searchBar || ""}`}>
                    <InputText
                        name="search-bar"
                        rawInputValue={store.query}
                        onChange={text => store.query = text}
                        placeholder={searchBarPlaceholder}
                    />
                </div>
            );
        }

        return null;
    }

    private getSelectionObjectIcon() {
        switch (this.selectionStatus) {
            case "none": return "check_box_outline_blank";
            case "selected": return "check_box";
            default: return "indeterminate_check_box";
        }
    }

    render() {
        const {classNames, group, operationList, store} = this.props;
        return (
            <div className={`${styles.bar} ${classNames!.bar || ""} ${this.selectedList.length ? `${styles.selection} ${classNames!.selection || ""}` : ""}`}>
                <div className={`${styles.buttons} ${classNames!.buttons || ""}`}>
                    {this.getSelectionButton()}
                    {this.getSortButton()}
                    {this.getGroupButton()}
                    {group ?
                        <strong>{`${group.label} (${group.totalCount})`}</strong>
                    : null}
                     {this.selectedList.length ?
                        <strong>{`${this.selectedList.length} ${i18n.t(`list.actionBar.selectedItem${this.selectedList.length > 1 ? "s" : ""}`)}`}</strong>
                    : null}
                    {this.getSearchBar()}
                </div>
                {this.selectedList.length && operationList && operationList.length && (!store.groupingKey || group) ?
                    <ContextualActions operationList={operationList} operationParam={this.selectedList} />
                : null}
            </div>
        );
    }
}
