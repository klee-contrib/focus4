import {ComponentType, ReactElement, ReactNode, SyntheticEvent} from "react";

import {CSSProp, getIcon, useTheme} from "@focus4/styling";
import {Button, ButtonMenu, IconButton, IconMenu, MenuItem, MenuItemProps, tooltipFactory} from "@focus4/toolbox";

import contextualActionsCss, {ContextualActionsCss} from "./__style__/contextual-actions.css";
export {contextualActionsCss, ContextualActionsCss};

const TooltipButton = tooltipFactory()(Button);
const TooltipIconButton = tooltipFactory()(IconButton);

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
    | ComponentType<OperationListItemComponentProps<T>>
    | {
          /** L'action à effectuer. */
          action: (data: T) => void;
          /** Le libellé (ou la tooltip) du bouton. */
          label?: string;
          /** L'icône du bouton */
          icon?: ReactNode;
          /** Type d'affichage pour l'action. Seul "secondary" sera pris en compte pour un mosaïque. Par défaut : "icon-label". */
          type?: "icon-label" | "icon-tooltip" | "icon" | "label" | "secondary";
      };

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
    theme?: CSSProp<ContextualActionsCss>;
}

/** Affiche une liste d'actions contextuelles. */
export function ContextualActions({
    data,
    i18nPrefix = "focus",
    isMosaic = false,
    onClickMenu,
    onHideMenu,
    operationList,
    theme: pTheme
}: ContextualActionsProps) {
    const theme = useTheme("contextualActions", contextualActionsCss, pTheme);

    function handleAction(key: number, e: SyntheticEvent<any>) {
        // On arrête bien tous les autres évènements, pour être sûr.
        e.preventDefault();
        e.stopPropagation();
        const item = operationList[key];
        if (!isComponent(item)) {
            item.action(data);
        }
    }

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
                        key={key}
                        floating={isMosaic ? true : undefined}
                        icon={
                            isMosaic || !Operation.type || Operation.type.includes("icon") ? Operation.icon : undefined
                        }
                        label={!isMosaic && FinalButton === Button ? Operation.label : undefined}
                        onClick={(e: any) => handleAction(key, e)}
                        primary={isMosaic}
                        tooltip={
                            FinalButton === TooltipButton || FinalButton === TooltipIconButton
                                ? Operation.label
                                : undefined
                        }
                    />
                );
            } else if (Operation.label) {
                secondaryActions.push({
                    icon: Operation.icon,
                    onClick: (e: any) => handleAction(key, e),
                    caption: Operation.label
                });
            }
            return actionLists;
        },
        {
            customComponents: [] as ReactElement[],
            primaryActions: [] as ReactElement[],
            secondaryActions: [] as MenuItemProps[]
        }
    );
    return (
        <div className={!isMosaic ? theme.text() : theme.fab()}>
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
    );
}

function isComponent<T>(item: OperationListItem<T>): item is ComponentType<OperationListItemComponentProps<T>> {
    return !(item as any).action;
}
