import {useContext} from "react";

import {CSSProp, useTheme} from "@focus4/styling";
import {
    FloatingActionButton,
    FloatingActionButtonProps,
    Menu,
    MenuItem,
    MenuItemProps,
    Tooltip,
    TooltipProps,
    useMenu
} from "@focus4/toolbox";

import {ScrollableContext} from "../utils/contexts";

import headerCss from "./__style__/header.css";

/** Action principale, affichée dans son propre bouton. */
type PrimaryAction = FloatingActionButtonProps & {
    /** A renseigner pour poser une tooltip autour du bouton. */
    tooltip?: Omit<TooltipProps, "children">;
};

/** Props des actions du header. */
export interface HeaderActionsProps {
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Actions principales. */
    primary?: PrimaryAction[];
    /** Actions secondaires. */
    secondary?: MenuItemProps[];
    /** Pour personnaliser le bouton du menu des actions secondaires. */
    secondaryButton?: PrimaryAction;
    /** CSS. */
    theme?: CSSProp<{
        actions?: string;
        secondaryActions?: string;
    }>;
}

/**
 * Barre d'actions du header.
 *
 * Sera affichée sous le `HeaderContent` s'il y en a un et qu'il est encore affiché sur la page, puis en sticky sous le `HeaderTopRow`.
 */
export function HeaderActions({
    i18nPrefix = "focus",
    primary = [],
    secondary = [],
    secondaryButton = {},
    theme: pTheme
}: HeaderActionsProps) {
    const theme = useTheme("header", headerCss, pTheme);

    const {headerHeight} = useContext(ScrollableContext);

    const menu = useMenu();

    if (!primary.length && !secondary.length) {
        return null;
    }

    const secondaryFAB = (
        <FloatingActionButton
            {...secondaryButton}
            icon={secondaryButton.icon ?? {i18nKey: `${i18nPrefix}.icons.headerActions.secondary`}}
            onClick={menu.toggle}
        />
    );

    return (
        <div
            className={theme.actions()}
            style={{top: `calc(${headerHeight}px - var(--floating-action-button-size) / 2)`}}
        >
            {secondary.length > 0 ? (
                <div ref={menu.anchor} style={{position: "relative"}}>
                    {secondaryButton.tooltip ? (
                        <Tooltip {...secondaryButton.tooltip}>{secondaryFAB}</Tooltip>
                    ) : (
                        secondaryFAB
                    )}
                    <Menu {...menu}>
                        {secondary.map((action, i) => (
                            <MenuItem key={`${i}`} {...action} />
                        ))}
                    </Menu>
                </div>
            ) : null}
            {primary
                .map((action, i) => {
                    const button = <FloatingActionButton key={`${i}`} {...action} />;

                    if (action.tooltip && !action.disabled) {
                        return (
                            <Tooltip key={`${i}`} {...action.tooltip}>
                                {button}
                            </Tooltip>
                        );
                    } else {
                        return button;
                    }
                })
                .reverse()}
        </div>
    );
}
