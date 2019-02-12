import * as React from "react";
import {Button, ButtonProps} from "react-toolbox/lib/button";
import {MenuItemProps} from "react-toolbox/lib/menu";
import Tooltip, {TooltipProps} from "react-toolbox/lib/tooltip";

import {ButtonMenu, getIcon, MenuItem} from "../../components";
import {themr} from "../../theme";

import * as styles from "./__style__/header.css";
const Theme = themr("header", styles);

const TooltipButton = Tooltip(Button);

/** Action principale, affichée dans son propre bouton. */
export type PrimaryAction = ButtonProps &
    TooltipProps & {
        /** Icône custom (non material). */
        iconCustom?: boolean;
    };

/** Action secondaire, affichée dans un menu. */
export interface SecondaryAction extends MenuItemProps {
    /** Icône custom (non material). */
    iconCustom?: boolean;
}

/** Props des actions du header. */
export interface HeaderActionsProps {
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Actions principales. */
    primary?: PrimaryAction[];
    /** Actions secondaires. */
    secondary?: SecondaryAction[];
    /** Pour personnaliser le bouton du menu des actions secondaires. */
    secondaryButton?: PrimaryAction;
    /** CSS. */
    theme?: {
        actions?: string;
    };
}

/** Barre d'actions du header. */
export function HeaderActions({
    i18nPrefix = "focus",
    primary = [],
    secondary = [],
    secondaryButton = {},
    theme: pTheme
}: HeaderActionsProps) {
    return (
        <Theme theme={pTheme}>
            {theme => (
                <div className={theme.actions}>
                    {primary.map((action, i) => {
                        const FinalButton = action.tooltip ? TooltipButton : Button;
                        return (
                            <FinalButton
                                key={`${i}`}
                                floating={true}
                                {...action}
                                icon={getIcon(action.icon, action.iconCustom || false)}
                            />
                        );
                    })}
                    {secondary.length > 0 ? (
                        <ButtonMenu
                            button={{
                                floating: true,
                                ...secondaryButton,
                                icon: secondaryButton.icon
                                    ? getIcon(secondaryButton.icon, secondaryButton.iconCustom || false)
                                    : getIcon(`${i18nPrefix}.icons.headerActions.secondary`)
                            }}
                            position="topRight"
                        >
                            {secondary.map((action, i) => (
                                <MenuItem
                                    key={`${i}`}
                                    {...action}
                                    icon={getIcon(action.icon, action.iconCustom || false)}
                                />
                            ))}
                        </ButtonMenu>
                    ) : null}
                </div>
            )}
        </Theme>
    );
}
