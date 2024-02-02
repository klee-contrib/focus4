import {ReactElement} from "react";

import {CSSProp, useTheme} from "@focus4/styling";
import {
    Button,
    FloatingActionButton,
    Icon,
    IconButton,
    Menu,
    MenuItem,
    MenuItemProps,
    Tooltip,
    useMenu
} from "@focus4/toolbox";

import contextualActionsCss, {ContextualActionsCss} from "./__style__/contextual-actions.css";
export {contextualActionsCss, ContextualActionsCss};

/** Description d'une action sur un ou plusieurs éléments de liste. */
export interface OperationListItem<T> {
    /** L'action à effectuer. */
    action: (data: T) => void;
    /** Couleur du bouton (si pas secondaire). */
    color?: "accent" | "light" | "primary";
    /** Le libellé (ou la tooltip) du bouton. */
    label?: string;
    /** L'icône du bouton */
    icon?: Icon;
    /** Variante du bouton (si pas secondaire). */
    variant?: "elevated-filled" | "elevated" | "filled" | "outlined";
    /** Type d'affichage pour l'action. Seul "secondary" sera pris en compte pour une mosaïque. Par défaut : "icon-label". */
    type?: "icon-label" | "icon-tooltip" | "icon" | "label" | "secondary";
}

/** Props du composant d'actions contextuelles. */
export interface ContextualActionsProps {
    /** Le paramètre à passer aux actions. */
    data: any;
    /** Préfixe i18n pour l'icône de dropdown. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Mode mosaïque. */
    isMosaic?: boolean;
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
    operationList,
    theme: pTheme
}: ContextualActionsProps) {
    const theme = useTheme("contextualActions", contextualActionsCss, pTheme);

    const {primaryActions, secondaryActions} = operationList.reduce(
        (actionLists, Operation, key) => {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const {primaryActions, secondaryActions} = actionLists;
            if (Operation.type !== "secondary") {
                const hasTooltip = (isMosaic && !!Operation.label) || Operation.type === "icon-tooltip";
                const FinalButton = isMosaic
                    ? FloatingActionButton
                    : !isMosaic && (Operation.type === "icon" || Operation.type === "icon-tooltip")
                    ? IconButton
                    : Button;
                const button = (
                    <FinalButton
                        key={key}
                        color={isMosaic ? "primary" : Operation.color}
                        icon={
                            (isMosaic || !Operation.type || Operation.type.includes("icon")
                                ? Operation.icon
                                : undefined)!
                        }
                        label={!isMosaic && FinalButton === Button ? Operation.label : undefined}
                        onClick={() => operationList[key].action(data)}
                        variant={Operation.variant as "filled"}
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
                    iconLeft: Operation.icon,
                    onClick: () => operationList[key].action(data),
                    caption: Operation.label
                });
            }
            return actionLists;
        },
        {
            primaryActions: [] as ReactElement[],
            secondaryActions: [] as MenuItemProps[]
        }
    );

    const menu = useMenu();
    const secondaryActionMenu = secondaryActions.length ? (
        <div ref={menu.anchor} style={{position: "relative"}}>
            {isMosaic ? (
                <FloatingActionButton
                    icon={{i18nKey: `${i18nPrefix}.icons.contextualActions.secondary`}}
                    onClick={menu.toggle}
                />
            ) : (
                <IconButton icon={{i18nKey: `${i18nPrefix}.icons.contextualActions.secondary`}} onClick={menu.toggle} />
            )}
            <Menu {...menu}>
                {secondaryActions.map((a, i) => (
                    <MenuItem key={i} {...a} />
                ))}
            </Menu>
        </div>
    ) : null;

    return (
        <div className={!isMosaic ? theme.text() : theme.fab()}>
            {operationList[0]?.type === "secondary" ? (
                <>
                    {secondaryActionMenu}
                    {primaryActions}
                </>
            ) : (
                <>
                    {primaryActions}
                    {secondaryActionMenu}
                </>
            )}
        </div>
    );
}
