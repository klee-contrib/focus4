import {autobind} from "core-decorators";
import * as React from "react";
import {themr} from "react-css-themr";

import {Button} from "react-toolbox/lib/button";
import {IconMenu, MenuItem, MenuItemProps} from "react-toolbox/lib/menu";

import { ButtonMenu, getIcon } from "../../components";

import * as styles from "./__style__/contextual-actions.css";

export type ContextualActionsStyle = Partial<typeof styles>;

/** Description d'une action sur un ou plusieurs éléments de liste. */
export interface OperationListItem<T> {
    /** L'action à effectuer. */
    action: (data: T | T[]) => void;
    /** Le libellé du bouton. */
    label?: string;
    /** L'icône du bouton */
    icon?: React.ReactNode;
    /** Précise si l'action est secondaire (sera affichée dans une dropdown au lieu de son propre bouton) */
    isSecondary?: boolean;
    /** Force l'affichage de l'icône en vue liste (elle est toujours visible en mosaïque) */
    showIcon?: boolean;
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
    /** Préfixe i18n pour l'icône de dropdown. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Mode mosaïque. */
    isMosaic?: boolean;
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
        const {operationList, i18nPrefix = "focus", isMosaic, theme} = this.props;
        const {primaryActionList, secondaryActionList} = operationList.reduce((actionLists, {isSecondary, icon, label, showIcon}, key) => {
            const {primaryActionList: primaryActions, secondaryActionList: secondaryActions} = actionLists;
            if (!isSecondary) {
                primaryActions.push(
                    <Button
                        primary={isMosaic}
                        onClick={this.handleAction(key)}
                        icon={(!isMosaic && showIcon || isMosaic) && icon || undefined}
                        key={key}
                        label={!isMosaic && label || undefined}
                        floating={isMosaic}
                    />
                );
            } else if (label) {
                secondaryActions.push({
                    icon,
                    onClick: this.handleAction(key),
                    caption: label
                });
            }
            return actionLists;
        }, {primaryActionList: [] as React.ReactElement<any>[], secondaryActionList: [] as MenuItemProps[]});
        return (
            <div className={!isMosaic ? theme!.text! : theme!.fab!}>
                {primaryActionList}
                {secondaryActionList.length ?
                    !isMosaic ?
                        <IconMenu
                            icon={getIcon(`${i18nPrefix}.icons.contextualActions.secondary`)}
                            position="topRight"
                        >
                            {secondaryActionList.map(a => <MenuItem {...a} />)}
                        </IconMenu>
                    :
                        <ButtonMenu
                            button={{
                                icon: getIcon(`${i18nPrefix}.icons.contextualActions.secondary`),
                                floating: true
                            }}
                            position="topRight"
                        >
                            {secondaryActionList.map(a => <MenuItem {...a} />)}
                        </ButtonMenu>
                : null}
            </div>
        );
    }
}

export default themr("contextualActions", styles)(ContextualActions);
