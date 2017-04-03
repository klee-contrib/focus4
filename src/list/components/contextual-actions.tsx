import {autobind} from "core-decorators";
import * as React from "react";

import Button from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";

import {injectStyle} from "../../theming";

import {OperationListItem} from "./line";

import * as styles from "./style/contextual-actions.css";
export type ContextualActionsStyle = Partial<typeof styles>;

export interface ContextualActionsProps {
    classNames?: ContextualActionsStyle;
    operationList: OperationListItem<{}>[];
    operationParam: {} | {}[];
}

@injectStyle("contextualActions")
export class ContextualActions extends React.Component<ContextualActionsProps, void> {

    @autobind
    private handleAction(key: number) {
        const {operationList, operationParam} = this.props;
        return (e: React.SyntheticEvent<any>) => {
            e.preventDefault();
            e.stopPropagation();
            operationList[key].action(operationParam);
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
            <div className={`${styles.actions} ${classNames!.actions}`}>
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
