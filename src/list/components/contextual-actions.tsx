import {autobind} from "core-decorators";
import * as React from "react";

import * as defaults from "../../defaults";

import {OperationListItem} from "./lines";

export interface ContextualActionsProps {
    ButtonComponent?: defaults.ReactComponent<any>;
    operationList: OperationListItem[];
    operationParam?: {};
}

export class ContextualActions extends React.Component<ContextualActionsProps, void> {

    @autobind
    private handleAction(key: number) {
        const {operationList, operationParam} = this.props;
        return () => {
            event.preventDefault();
            event.stopPropagation();
            if (operationParam) {
                operationList[key].action(operationParam);
            } else {
                operationList[key].action();
            }
        };
    }

    render() {
        const {operationList, operationParam, ButtonComponent} = this.props;

        const Button = ButtonComponent || defaults.Button;
        const {Dropdown} = defaults;
        if (!Button || !Dropdown) {
            throw new Error("Button ou Dropdown n'ont pas été définis et vous avez pas fourni de ButtonComponent à ce ContextualActions");
        }

        const {primaryActionList, secondaryActionList} = operationList.reduce((actionLists, operation, key) => {
            let {primaryActionList: primaryActions, secondaryActionList: secondaryActions} = actionLists;
            if (1 === operation.priority) {
                primaryActions.push(
                    <Button
                        handleOnClick={this.handleAction(key)}
                        icon={operation.icon}
                        iconLibrary={operation.iconLibrary}
                        key={key}
                        label={operation.label}
                        shape={operation.style && operation.style.shape || "icon"}
                        style={operation.style || {}}
                        type="button"
                        {...operation}
                    />
                );
            } else {
                secondaryActions.push(operation);
            }
            return actionLists;
        }, {primaryActionList: [] as React.ReactElement<any>[], secondaryActionList: [] as OperationListItem[]});
        return (
            <div className="list-action-contextual">
                <span>{primaryActionList}</span>
                <Dropdown
                    operationList={secondaryActionList}
                    operationParam={operationParam}
                />
            </div>
        );
    }
}
