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

export {contextualActionsCss};
export type {ContextualActionsCss};

/** Description d'une action sur un ou plusieurs éléments de liste. */
export interface OperationListItem<T> {
    /** L'action à effectuer. */
    action: (data: T) => void;
    /** Couleur du bouton. Si c'est une action secondaire, ce sera la couleur du bouton d'actions secondaires. S'il y en a plusieurs, c'est la première valeur non vide qui sera utilisée. */
    color?: "accent" | "light" | "primary";
    /** Affiche l'action, mais désactivée. */
    disabled?: boolean;
    /** Le libellé (ou la tooltip) du bouton. */
    label?: string;
    /** Affiche un indicateur de chargement sur l'action (action principale uniquement). */
    loading?: boolean;
    /** L'icône du bouton */
    icon?: Icon;
    /** Label pour la tooltip du bouton d'actions secondaires, si l'action est de type `secondary`. S'il y a plusieurs actions secondaires, c'est le premier label non vide qui sera utilisé. */
    secondaryLabel?: string;
    /** Affiche quand même l'action même les données qui y seraient passées sont vides (par exemple s'il n'y a pas d'élément sélectionné dans le store pour une action globale). */
    showIfNoData?: boolean;
    /** Type d'affichage pour l'action. Seul "secondary" sera pris en compte pour une mosaïque. Par défaut : "icon-label". */
    type?: "icon-label" | "icon-tooltip" | "icon" | "label" | "secondary";
    /** Variante du bouton. Si c'est une action secondaire, ce sera la variante du bouton d'actions secondaires. S'il y en a plusieurs, c'est la première valeur non vide qui sera utilisée. */
    variant?: "elevated-filled" | "elevated" | "filled" | "outlined";
}

/** Props du composant d'actions contextuelles. */
export interface ContextualActionsProps<T> {
    /** Le paramètre à passer aux actions. */
    data: T;
    /** Préfixe i18n pour l'icône de dropdown. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Mode mosaïque. */
    isMosaic?: boolean;
    /** La liste d'actions. */
    operationList: OperationListItem<T>[];
    /** CSS. */
    theme?: CSSProp<ContextualActionsCss>;
}

/** Affiche une liste d'actions contextuelles. */
export function ContextualActions<T>({
    data,
    i18nPrefix = "focus",
    isMosaic = false,
    operationList,
    theme: pTheme
}: ContextualActionsProps<T>) {
    const theme = useTheme("contextualActions", contextualActionsCss, pTheme);

    const {primaryActions, secondaryActions} = operationList.reduce(
        (actionLists, operation, key) => {
            const {primaryActions, secondaryActions} = actionLists;
            if (operation.type !== "secondary") {
                const hasTooltip = (isMosaic && !!operation.label) || operation.type === "icon-tooltip";
                const FinalButton = isMosaic
                    ? FloatingActionButton
                    : !isMosaic && (operation.type === "icon" || operation.type === "icon-tooltip")
                      ? IconButton
                      : Button;
                const button = (
                    <FinalButton
                        key={key}
                        className={theme.item({
                            hidden:
                                (data === undefined || (Array.isArray(data) && data.length === 0)) &&
                                !operation.showIfNoData
                        })}
                        color={isMosaic ? "primary" : operation.color}
                        disabled={operation.disabled}
                        icon={
                            (isMosaic || !operation.type || operation.type.includes("icon")
                                ? operation.icon
                                : undefined)!
                        }
                        label={!isMosaic && FinalButton === Button ? operation.label : undefined}
                        loading={operation.loading}
                        onClick={e => {
                            e.stopPropagation();
                            operationList[key].action(data);
                        }}
                        variant={operation.variant as "filled"}
                    />
                );
                primaryActions.push(
                    hasTooltip ? (
                        <Tooltip key={key} tooltip={operation.label}>
                            {button}
                        </Tooltip>
                    ) : (
                        button
                    )
                );
            } else if (operation.label) {
                secondaryActions.push({
                    hidden:
                        (data === undefined || (Array.isArray(data) && data.length === 0)) && !operation.showIfNoData,
                    iconLeft: operation.icon,
                    onClick: () => operationList[key].action(data),
                    caption: operation.label,
                    disabled: operation.disabled
                });
            }
            return actionLists;
        },
        {
            primaryActions: [] as ReactElement[],
            secondaryActions: [] as (MenuItemProps & {hidden: boolean})[]
        }
    );

    const menu = useMenu();
    const saColor = operationList.find(sa => sa.type === "secondary" && !!sa.color)?.color;
    const saTooltip = operationList.find(sa => sa.type === "secondary" && !!sa.secondaryLabel)?.secondaryLabel;
    const saButton = isMosaic ? (
        <FloatingActionButton
            className={theme.item({hidden: secondaryActions.every(c => c.hidden)})}
            color={saColor}
            icon={{i18nKey: `${i18nPrefix}.icons.contextualActions.secondary`}}
            onClick={e => {
                e.stopPropagation();
                menu.toggle();
            }}
        />
    ) : (
        <IconButton
            className={theme.item({hidden: secondaryActions.every(c => c.hidden)})}
            color={saColor}
            icon={{i18nKey: `${i18nPrefix}.icons.contextualActions.secondary`}}
            onClick={e => {
                e.stopPropagation();
                menu.toggle();
            }}
            variant={operationList.find(sa => sa.type === "secondary" && !!sa.variant)?.variant as "filled"}
        />
    );

    const secondaryActionMenu = secondaryActions.length ? (
        <div ref={menu.anchor} style={{position: "relative"}}>
            {saTooltip ? <Tooltip tooltip={saTooltip}>{saButton}</Tooltip> : saButton}
            <Menu {...menu}>
                {secondaryActions
                    .filter(a => !a.hidden)
                    .map(({hidden: _, ...a}, i) => (
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
