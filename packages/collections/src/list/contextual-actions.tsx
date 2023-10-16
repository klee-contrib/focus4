import {ComponentType, ReactElement, ReactNode, SyntheticEvent, useEffect} from "react";

import {CSSProp, getIcon, useTheme} from "@focus4/styling";
import {
    Button,
    FloatingActionButton,
    IconButton,
    Menu,
    MenuItem,
    MenuItemProps,
    Tooltip,
    useMenu
} from "@focus4/toolbox";

import contextualActionsCss, {ContextualActionsCss} from "./__style__/contextual-actions.css";
export {contextualActionsCss, ContextualActionsCss};

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
          /** Type d'affichage pour l'action. Seul "secondary" sera pris en compte pour une mosaïque. Par défaut : "icon-label". */
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

    const menu = useMenu();
    useEffect(() => {
        if (menu.active) {
            onClickMenu?.();
        } else {
            onHideMenu?.();
        }
    }, [menu.active]);

    function tryHideMenu() {
        if (!menu.active) {
            onHideMenu?.();
        }
    }

    const lists = operationList.reduce(
        (actionLists, Operation, key) => {
            const {customComponents, primaryActions, secondaryActions} = actionLists;
            if (isComponent(Operation)) {
                customComponents.push(<Operation data={data} onClickMenu={onClickMenu} onHideMenu={tryHideMenu} />);
            } else if (Operation.type !== "secondary") {
                const hasTooltip = (isMosaic && !!Operation.label) || Operation.type === "icon-tooltip";
                const FinalButton = isMosaic
                    ? FloatingActionButton
                    : !isMosaic && (Operation.type === "icon" || Operation.type === "icon-tooltip")
                    ? IconButton
                    : Button;
                const button = (
                    <FinalButton
                        key={key}
                        color={isMosaic ? "primary" : undefined}
                        icon={
                            isMosaic || !Operation.type || Operation.type.includes("icon") ? Operation.icon : undefined
                        }
                        label={!isMosaic && FinalButton === Button ? Operation.label : undefined}
                        onBlur={tryHideMenu}
                        onClick={(e: any) => handleAction(key, e)}
                        onFocus={onClickMenu}
                    />
                );
                primaryActions.push(
                    hasTooltip ? (
                        <Tooltip key={key} tooltip={Operation.label}>
                            {button}
                        </Tooltip>
                    ) : (
                        button
                    )
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
                <div ref={menu.anchor} style={{position: "relative"}}>
                    {isMosaic ? (
                        <FloatingActionButton
                            icon={getIcon(`${i18nPrefix}.icons.contextualActions.secondary`)}
                            onBlur={tryHideMenu}
                            onClick={menu.toggle}
                            onFocus={onClickMenu}
                        />
                    ) : (
                        <IconButton
                            icon={getIcon(`${i18nPrefix}.icons.contextualActions.secondary`)}
                            onBlur={tryHideMenu}
                            onClick={menu.toggle}
                            onFocus={onClickMenu}
                        />
                    )}
                    <Menu {...menu}>
                        {lists.secondaryActions.map((a, i) => (
                            <MenuItem key={i} {...a} />
                        ))}
                    </Menu>
                </div>
            ) : null}
        </div>
    );
}

function isComponent<T>(item: OperationListItem<T>): item is ComponentType<OperationListItemComponentProps<T>> {
    return !(item as any).action;
}
