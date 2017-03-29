import {autobind} from "core-decorators";
import * as React from "react";

import Button from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";

import {injectStyle} from "../../theming";

import {OperationListItem} from "./line";

import * as styles from "./style/action-bar.css";

export interface ContextualActionsProps {
    classNames?: typeof styles;
    operationList: OperationListItem[];
    operationParam?: {};
}

@injectStyle("actionBar")
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
        const {classNames, operationList, operationParam} = this.props;
        const {primaryActionList, secondaryActionList} = operationList.reduce((actionLists, {action, isSecondary, icon, iconLibrary, label, buttonShape = null, style}, key) => {
            const {primaryActionList: primaryActions, secondaryActionList: secondaryActions} = actionLists;
            if (!isSecondary) {
                primaryActions.push(
                    <Button
                        handleOnClick={this.handleAction(key)}
                        icon={icon}
                        iconLibrary={iconLibrary}
                        key={key}
                        label={label}
                        shape={buttonShape}
                        style={typeof style === "object" ? style : {}}
                        type="button"
                    />
                );
            } else {
                secondaryActions.push({
                    action,
                    label,
                    style: typeof style === "string" ? style : ""
                });
            }
            return actionLists;
        }, {primaryActionList: [] as React.ReactElement<any>[], secondaryActionList: [] as DropdownItem[]});
        return (
            <div className={`${styles.contextualActions} ${classNames!.contextualActions}`}>
                {primaryActionList}
                {secondaryActionList.length ?
                    <Dropdown
                        operations={secondaryActionList}
                        operationParam={operationParam}
                        position={{
                            horizontal: "right",
                            vertical: "bottom"
                        }}
                    />
                : null}
            </div>
        );
    }
}
