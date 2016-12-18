import {autobind} from "core-decorators";
import * as React from "react";

import Button from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";

import {OperationListItem} from "./line";

export interface ContextualActionsProps {
    operationList: OperationListItem[];
    operationParam?: {};
}

export class ContextualActions extends React.Component<ContextualActionsProps, void> {

    @autobind
    private handleAction(key: number) {
        const {operationList, operationParam} = this.props;
        return (e: React.SyntheticEvent<any>) => {
            e.preventDefault();
            e.stopPropagation();
            if (operationParam) {
                operationList[key].action(operationParam);
            } else {
                operationList[key].action();
            }
        };
    }

    render() {
        const {operationList, operationParam} = this.props;
        const {primaryActionList, secondaryActionList} = operationList.reduce((actionLists, {priority, icon, iconLibrary, label, buttonShape, style}, key) => {
            let {primaryActionList: primaryActions, secondaryActionList: secondaryActions} = actionLists;
            if (1 === priority) {
                primaryActions.push(
                    <Button
                        handleOnClick={this.handleAction(key)}
                        icon={icon}
                        iconLibrary={iconLibrary}
                        key={key}
                        label={label}
                        shape={buttonShape || "icon"}
                        style={typeof style === "object" ? style : {}}
                        type="button"
                    />
                );
            } else {
                secondaryActions.push({
                    action: this.handleAction(key),
                    label,
                    style: typeof style === "string" ? style : ""
                });
            }
            return actionLists;
        }, {primaryActionList: [] as React.ReactElement<any>[], secondaryActionList: [] as DropdownItem[]});
        return (
            <div>
                <span>{primaryActionList}</span>
                <Dropdown
                    operations={secondaryActionList}
                    operationParam={operationParam}
                />
            </div>
        );
    }
}
