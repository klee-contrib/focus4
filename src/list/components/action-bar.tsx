import {autobind} from "core-decorators";
import {reduce} from "lodash";
import * as React from "react";

import * as defaults from "../../defaults";
import {translate} from "../../translation";

import {ContextualActions} from "./contextual-actions";
import {OperationListItem} from "./lines";
import {TopicDisplayer} from "./topic-displayer";

export interface ActionBarProps {
    hasSelection?: boolean;
    hasGrouping?: boolean;
    selectionStatus?: "none" | "partial" | "selected";
    selectionAction?: (selectionStatus?: "none" | "partial" | "selected") => void;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    orderAction?: (key: string, order: boolean) => void;
    orderSelected?: {key?: string, order?: boolean};
    facetClickAction?: (key: string) => void;
    facetList?: {[facet: string]: {code: string, label: string, value: string}};
    groupableColumnList?: {[column: string]: string};
    groupAction?: (key?: string) => void;
    groupSelectedKey?: string;
    operationList?: OperationListItem[];
    groupLabelPrefix?: string;
}

@autobind
export class ActionBar extends React.Component<ActionBarProps, void> {

    getSelectionObject() {
        const {hasSelection, selectionAction, selectionStatus} = this.props;
        if (hasSelection && selectionAction) {
            const {Button} = defaults;
            if (!Button) {
                throw "Déso";
            }
            const onIconClick = () => {
                const newSelectionStatus = selectionStatus === "none" ? "selected" : "none";
                selectionAction(newSelectionStatus);
            };
            return <Button shape="icon" icon={this.getSelectionObjectIcon()} handleOnClick={onIconClick} />;
        } else if (hasSelection) {
            console.warn("Pour utiliser la fonction de sélection de l'ActionBar, il est nécessaire de spécifier les props 'selectionAction' et 'selectionStatus'.");
        }

        return null;
    }

    getOrderObject() {
        const {orderableColumnList, orderSelected, orderAction} = this.props;
        if (orderableColumnList && orderSelected && orderSelected.key && orderSelected.order !== undefined && orderAction) {
            const {Dropdown} = defaults;
            if (!Dropdown) {
                throw "Déso";
            }
            const orderOperationList: OperationListItem[] = []; // [{key:'columnKey', order:'asc', label:'columnLabel'}]
            for (const key in orderableColumnList) {
                const description = orderableColumnList[key];
                orderOperationList.push({
                    action: () => orderAction(description.key, description.order),
                    label: description.label,
                    style: this.getSelectedStyle(description.key + description.order, orderSelected.key + (orderSelected.order ? "asc" : "desc"))
                });
            }
            return <Dropdown iconProps={{name: "sort_by_alpha"}} key="down" operationList={orderOperationList} />;
        }

        return null;
    }

    getGroupObject() {
        const {hasGrouping, groupLabelPrefix = "", groupSelectedKey, groupableColumnList, groupAction} = this.props;
        if (hasGrouping && groupSelectedKey && groupableColumnList && groupAction) {
            const {Dropdown} = defaults;
            if (!Dropdown) {
                throw "Déso";
            }
            const groupOperationList = reduce(groupableColumnList, (operationList, label, key) => {
                operationList.push({
                    action: () => groupAction(key),
                    label: translate(groupLabelPrefix + label),
                    style: this.getSelectedStyle(key, groupSelectedKey)
                });
                return operationList;
            }, [] as OperationListItem[]).concat([{
                label: translate("list.actionBar.ungroup"),
                action: () => groupAction()
            }]);

            return <Dropdown iconProps={{name: "folder_open"}} operationList={groupOperationList} />;
        } else if (hasGrouping) {
            console.warn("Pour utiliser la fonction de groupe de l'ActionBar, il est nécessaire de spécifier les props 'groupSelectedKey', 'groupableColumnList' et 'groupAction'.");
        }

        return null;
    }

    getSelectedStyle(currentKey: string, selectedKey: string) {
        return currentKey === selectedKey ? " selected " : "";
    }

    getSelectionObjectIcon() {
        if ("none" === this.props.selectionStatus) {
            return "check_box_outline_blank";
        } else if ("selected" === this.props.selectionStatus) {
            return "check_box";
        }
        return "indeterminate_check_box";
    }

    render() {
        return (
            <div className="mdl-grid" data-focus="list-action-bar">
                <div className="mdl-cell" data-focus="global-list-content">
                    {this.getSelectionObject()}
                    {this.getOrderObject()}
                    {this.getGroupObject()}
                </div>
                <div className="mdl-cell mdl-cell--hide-tablet mdl-cell--hide-phone" data-focus="selected-facet-content">
                    <TopicDisplayer
                        displayLabels
                        topicClickAction={this.props.facetClickAction}
                        topicList={this.props.facetList}
                    />
                </div>
                <div className="mdl-cell" data-focus="contextual-action-content">
                    <ContextualActions operationList={this.props.operationList || []}/>
                </div>
            </div>
        );
    }
}
