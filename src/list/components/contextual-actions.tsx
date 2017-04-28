import {autobind} from "core-decorators";
import * as React from "react";
import {themr} from "react-css-themr";

import Button, {ButtonProps} from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";

import * as styles from "./__style__/contextual-actions.css";
export type ContextualActionsStyle = Partial<typeof styles>;

export interface OperationListItem<T> {
    action: (data: T | T[]) => void;
    label?: string;
    icon?: string;
    iconLibrary?: "material" | "font-awesome" | "font-custom";
    isSecondary?: boolean;
    showIcon?: boolean;
    style?: string | React.CSSProperties;
}

export interface GroupOperationListItem<T> extends OperationListItem<T> {
    action: (data: T[]) => void;
}

export interface LineOperationListItem<T> extends OperationListItem<T> {
    action: (data: T) => void;
}

export interface ContextualActionsProps {
    buttonShape?: ButtonProps["shape"];
    operationList: OperationListItem<{}>[];
    operationParam: {} | {}[];
    theme?: ContextualActionsStyle;
}

@themr("contextualActions", styles)
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
        const {buttonShape = null, operationList, operationParam, theme} = this.props;
        const isTextButton = buttonShape === null || buttonShape === "raised";
        const {primaryActionList, secondaryActionList} = operationList.reduce((actionLists, {action, isSecondary, icon, iconLibrary, label, showIcon, style}, key) => {
            const {primaryActionList: primaryActions, secondaryActionList: secondaryActions} = actionLists;
            if (!isSecondary) {
                primaryActions.push(
                    <Button
                        color={!isTextButton ? "primary" : undefined}
                        handleOnClick={this.handleAction(key)}
                        icon={(isTextButton && showIcon || !isTextButton) && icon || undefined}
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
            <div className={isTextButton ? theme!.text! : theme!.fab!}>
                {primaryActionList}
                {secondaryActionList.length ?
                    <Dropdown
                        button={{shape: isTextButton && "icon" || buttonShape, icon: "more_vert", color: !isTextButton ? "primary" : undefined}}
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
