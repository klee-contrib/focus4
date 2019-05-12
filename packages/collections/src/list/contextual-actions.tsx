import * as React from "react";
import {Button, IconButton} from "react-toolbox/lib/button";
import {IconMenu, MenuItem, MenuItemProps} from "react-toolbox/lib/menu";
import Tooltip from "react-toolbox/lib/tooltip";

import {ButtonMenu, getIcon} from "@focus4/components";
import {themr} from "@focus4/styling";

import * as styles from "./__style__/contextual-actions.css";
export type ContextualActionsStyle = Partial<typeof styles>;
const Theme = themr("contextualActions", styles);

const TooltipButton = Tooltip(Button);
const TooltipIconButton = Tooltip(IconButton);

/** Props passée à un composant d'action custom. */
export interface OperationListItemComponentProps<T> {
    /** Les données. */
    data: T;
    /** A passer au `onClick` d'un Menu pour gérer l'overflow et le hover. */
    onClickMenu?: () => void;
    /** A passer au `onHide` d'un Menu pour gérer l'overflow et le hover. */
    onHideMenu?: () => void;
}

/** Description d'une action sur un ou plusieurs éléments de liste. */
export type OperationListItem<T> =
    | {
          /** L'action à effectuer. */
          action: (data: T) => void;
          /** Le libellé (ou la tooltip) du bouton. */
          label?: string;
          /** L'icône du bouton */
          icon?: React.ReactNode;
          /** Type d'affichage pour l'action. Seul "secondary" sera pris en compte pour un mosaïque. Par défaut : "icon-label". */
          type?: "icon" | "label" | "icon-label" | "icon-tooltip" | "secondary";
      }
    | React.ComponentType<OperationListItemComponentProps<T>>;

/** Props du composant d'actions contextuelles. */
export interface ContextualActionsProps {
    /** Le paramètre à passer aux actions. */
    data: any;
    /** Préfixe i18n pour l'icône de dropdown. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Mode mosaïque. */
    isMosaic?: boolean;
    /** Quand on ouvre les actions secondaires. */
    onClickMenu?: () => void;
    /** Quand on ferme les actions secondaires. */
    onHideMenu?: () => void;
    /** La liste d'actions. */
    operationList: OperationListItem<any>[];
    /** CSS. */
    theme?: ContextualActionsStyle;
}

/** Affiche une liste d'actions contextuelles. */
export class ContextualActions extends React.Component<ContextualActionsProps> {
    /**
     * Exécute une action
     * @param key L'index de l'action dans la liste.
     */
    protected handleAction(key: number, e: React.SyntheticEvent<any>) {
        const {data, operationList} = this.props;

        // On arrête bien tous les autres évènements, pour être sûr.
        e.preventDefault();
        e.stopPropagation();
        const item = operationList[key];
        if (!isComponent(item)) {
            item.action(data);
        }
    }

    render() {
        const {data, operationList, i18nPrefix = "focus", isMosaic, onClickMenu, onHideMenu} = this.props;
        const lists = operationList.reduce(
            (actionLists, Operation, key) => {
                const {customComponents, primaryActions, secondaryActions} = actionLists;
                if (isComponent(Operation)) {
                    customComponents.push(<Operation data={data} onClickMenu={onClickMenu} onHideMenu={onHideMenu} />);
                } else if (Operation.type !== "secondary") {
                    const FinalButton =
                        isMosaic && Operation.label
                            ? TooltipButton
                            : (isMosaic && !Operation.label) || !Operation.type || Operation.type.includes("label")
                            ? Button
                            : Operation.type === "icon"
                            ? IconButton
                            : TooltipIconButton;
                    primaryActions.push(
                        <FinalButton
                            onClick={(e: any) => this.handleAction(key, e)}
                            icon={
                                isMosaic || !Operation.type || Operation.type.includes("icon")
                                    ? Operation.icon
                                    : undefined
                            }
                            key={key}
                            label={(!isMosaic && FinalButton === Button && Operation.label) || undefined}
                            tooltip={
                                FinalButton === TooltipButton || FinalButton === TooltipIconButton
                                    ? Operation.label
                                    : undefined
                            }
                            primary={isMosaic}
                            floating={isMosaic ? true : undefined}
                        />
                    );
                } else if (Operation.label) {
                    secondaryActions.push({
                        icon: Operation.icon,
                        onClick: (e: any) => this.handleAction(key, e),
                        caption: Operation.label
                    });
                }
                return actionLists;
            },
            {
                customComponents: [] as React.ReactElement[],
                primaryActions: [] as React.ReactElement[],
                secondaryActions: [] as MenuItemProps[]
            }
        );
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <div className={!isMosaic ? theme.text : theme.fab}>
                        {lists.customComponents}
                        {lists.primaryActions}
                        {lists.secondaryActions.length ? (
                            !isMosaic ? (
                                <IconMenu
                                    icon={getIcon(`${i18nPrefix}.icons.contextualActions.secondary`)}
                                    onClick={onClickMenu}
                                    onHide={onHideMenu}
                                >
                                    {lists.secondaryActions.map((a, i) => (
                                        <MenuItem key={i} {...a} />
                                    ))}
                                </IconMenu>
                            ) : (
                                <ButtonMenu
                                    button={{
                                        icon: getIcon(`${i18nPrefix}.icons.contextualActions.secondary`),
                                        floating: true
                                    }}
                                    onClick={onClickMenu}
                                    onHide={onHideMenu}
                                >
                                    {lists.secondaryActions.map((a, i) => (
                                        <MenuItem key={i} {...a} />
                                    ))}
                                </ButtonMenu>
                            )
                        ) : null}
                    </div>
                )}
            </Theme>
        );
    }
}

function isComponent<T>(item: OperationListItem<T>): item is React.ComponentType<OperationListItemComponentProps<T>> {
    return !(item as any).action;
}
