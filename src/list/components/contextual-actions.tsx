import {autobind} from "core-decorators";
import i18next from "i18next";
import * as React from "react";
import {themr} from "react-css-themr";

import Button, {ButtonProps} from "focus-components/button";
import Dropdown, {DropdownItem} from "focus-components/dropdown";

import * as styles from "./__style__/contextual-actions.css";
export type ContextualActionsStyle = Partial<typeof styles>;

/** Description d'une action sur un ou plusieurs éléments de liste. */
export interface OperationListItem<T> {
    /** L'action à effectuer. */
    action: (data: T | T[]) => void;
    /** Le libellé du bouton. */
    label?: string;
    /** L'icône du bouton */
    icon?: string;
    /** La librairie d'icône à utiliser. */
    iconLibrary?: "material" | "font-awesome" | "font-custom";
    /** Précise si l'action est secondaire (sera affichée dans une dropdown au lieu de son propre bouton) */
    isSecondary?: boolean;
    /** Force l'affichage de l'icône en vue liste (elle est toujours visible en mosaïque) */
    showIcon?: boolean;
    /** Style CSS additionnel */
    style?: string | React.CSSProperties;
}

/** Description d'une action sur plusieurs éléments de liste. */
export interface GroupOperationListItem<T> extends OperationListItem<T> {
    /** L'action à effectuer. */
    action: (data: T[]) => void;
}

/** Description d'une action sur un élément de liste. */
export interface LineOperationListItem<T> extends OperationListItem<T> {
    /** L'action à effectuer. */
    action: (data: T) => void;
}

/** Props du composant d'actions contextuelles. */
export interface ContextualActionsProps {
    /** Le format des boutons. */
    buttonShape?: ButtonProps["shape"];
    /** Préfixe i18n pour l'icône de dropdown. Par défaut : "focus". */
    i18nPrefix?: string;
    /** La liste d'actions. */
    operationList: OperationListItem<{}>[];
    /** Le paramètre à passer aux actions. */
    operationParam: {} | {}[];
    /** CSS. */
    theme?: ContextualActionsStyle;
}

/** Affiche une liste d'actions contextuelles. */
export class ContextualActions extends React.Component<ContextualActionsProps, void> {

    /**
     * Exécute une action
     * @param key L'index de l'action dans la liste.
     */
    @autobind
    private handleAction(key: number) {
        const {operationList, operationParam} = this.props;
        return (e: React.SyntheticEvent<any>) => {
            // On arrête bien tous les autres évènements, pour être sûr.
            e.preventDefault();
            e.stopPropagation();
            operationList[key].action(operationParam);
        };
    }

    render() {
        const {buttonShape = null, operationList, operationParam, i18nPrefix = "focus", theme} = this.props;
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
                        button={{
                            shape: isTextButton && "icon" || buttonShape,
                            icon: i18next.t(`${i18nPrefix}.icons.contextualActions.secondary.name`),
                            iconLibrary: i18next.t(`${i18nPrefix}.icons.contextualActions.secondary.library`),
                            color: !isTextButton ? "primary" : undefined
                        }}
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

export default themr("contextualActions", styles)(ContextualActions);
