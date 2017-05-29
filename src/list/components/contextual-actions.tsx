import {autobind} from "core-decorators";
import i18n from "i18next";
import * as React from "react";
import {themr} from "react-css-themr";

import {Button} from "react-toolbox/lib/button";
import {IconMenu, MenuItem, MenuItemProps} from "react-toolbox/lib/menu";

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
    buttonShape?: any;
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
        const {buttonShape = null, operationList, i18nPrefix = "focus", theme} = this.props;
        const isTextButton = buttonShape === null || buttonShape === "raised";
        const {primaryActionList, secondaryActionList} = operationList.reduce((actionLists, {isSecondary, icon, /*iconLibrary, */label, showIcon, style}, key) => {
            const {primaryActionList: primaryActions, secondaryActionList: secondaryActions} = actionLists;
            if (!isSecondary) {
                primaryActions.push(
                    <Button
                        primary={!isTextButton}
                        onClick={this.handleAction(key)}
                        icon={(isTextButton && showIcon || !isTextButton) && icon || undefined}
                        key={key}
                        label={label}
                        style={typeof style === "object" ? style : {}}
                    />
                );
            } else {
                secondaryActions.push({
                    onClick: this.handleAction(key),
                    caption: label!
                });
            }
            return actionLists;
        }, {primaryActionList: [] as React.ReactElement<any>[], secondaryActionList: [] as MenuItemProps[]});
        return (
            <div className={isTextButton ? theme!.text! : theme!.fab!}>
                {primaryActionList}
                {secondaryActionList.length ?
                    <IconMenu
                        icon={i18n.t(`${i18nPrefix}.icons.contextualActions.secondary.name`)}
                    >
                        {secondaryActionList.map(a => <MenuItem {...a} />)}
                    </IconMenu>
                : null}
            </div>
        );
    }
}

export default themr("contextualActions", styles)(ContextualActions);

// iconLibrary={iconLibrary}
