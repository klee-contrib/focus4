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
import {TopicDisplayer} from "./topic-displayer";

import * as styles from "./style/action-bar.css";
export type ActionBarStyle = Partial<typeof styles>;

export interface ActionBarProps {
    classNames?: ActionBarStyle;
    facetClickAction?: (key: string) => void;
    facetList?: {[facet: string]: {code: string, label: string, value: string}};
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

    private getSelectionObject() {
        const {hasSelection, store} = this.props;
        if (hasSelection) {
            return <Button shape="icon" icon={this.getSelectionObjectIcon()} handleOnClick={store.toggleAll} />;
        } else {
            return null;
        }
    }

    private getOrderObject() {
        const {orderableColumnList, store} = this.props;
        if (orderableColumnList) {
            const orderOperationList: DropdownItem[] = []; // [{key:'columnKey', order:'asc', label:'columnLabel'}]
            for (const key in orderableColumnList) {
                const description = orderableColumnList[key];
                orderOperationList.push({
                    action: action(() => {
                        store.sortBy = description.key;
                        store.sortAsc = description.order;
                    }),
                    label: description.label,
                    style: this.getSelectedStyle(description.key + description.order, store.sortBy + (store.sortAsc ? "asc" : "desc"))
                });
            }
            return <Dropdown button={{icon: "sort_by_alpha", shape: "icon"}} key="down" operations={orderOperationList} />;
        }

        return null;
    }

    private getGroupObject() {
        const {groupLabelPrefix = "", groupableColumnList, store} = this.props;
        if (groupableColumnList) {
            const groupOperationList = reduce(groupableColumnList, (operationList, label, key) => {
                operationList.push({
                    action: () => store.groupingKey = key,
                    label: i18n.t(groupLabelPrefix + label),
                    style: this.getSelectedStyle(key, store.groupingKey)
                });
                return operationList;
            }, [] as DropdownItem[]).concat([{
                action: () => store.groupingKey = undefined,
                label: i18n.t("list.actionBar.ungroup")
            }]);

            return <Dropdown button={{icon: "folder_open", shape: "icon"}} operations={groupOperationList} />;
        } else {
            return null;
        }
    }

    private getSelectedStyle(currentKey: string, selectedKey?: string) {
        return currentKey === selectedKey ? " selected " : "";
    }

    private getSelectionObjectIcon() {
        switch (this.props.store.selectionStatus) {
            case "none": return "check_box_outline_blank";
            case "selected": return "check_box";
            default: return "indeterminate_check_box";
        }
    }

    render() {
        const {facetClickAction, facetList, operationList, classNames} = this.props;
        return (
            <div className={`mdl-grid ${styles.actionBar} ${classNames!.actionBar}`}>
                <div className={`mdl-cell ${styles.buttons} ${classNames!.buttons}`}>
                    {this.getSelectionObject()}
                    {this.getOrderObject()}
                    {this.getGroupObject()}
                </div>
                <div className={`mdl-cell mdl-cell--hide-tablet mdl-cell--hide-phone ${styles.facets} ${classNames!.facets}`}>
                    <TopicDisplayer
                        topicClickAction={facetClickAction}
                        topicList={facetList}
                    />
                </div>
                {operationList && operationList.length ?
                    <div className={`mdl-cell ${styles.contextualActions} ${classNames!.contextualActions}`}>
                        <ContextualActions operationList={operationList}/>
                    </div>
                : null}
            </div>
        );
    }
}
