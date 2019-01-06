import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {Button, ButtonProps} from "react-toolbox/lib/button";
import {MenuItemProps} from "react-toolbox/lib/menu";
import Tooltip, {TooltipProps} from "react-toolbox/lib/tooltip";

import {ButtonMenu, getIcon, MenuItem} from "../../components";

import * as styles from "./__style__/header.css";

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
    /** CSS. */
    theme?: {
        actions?: string;
    };
}

/** Barre d'actions du header. */
export const HeaderActions = observer(
    ({i18nPrefix = "focus", primary = [], secondary = [], theme}: HeaderActionsProps) => (
        <div className={theme!.actions}>
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
                        icon: getIcon(`${i18nPrefix}.icons.headerActions.secondary`)
                    }}
                    position="topRight"
                >
                    {secondary.map((action, i) => (
                        <MenuItem key={`${i}`} {...action} icon={getIcon(action.icon, action.iconCustom || false)} />
                    ))}
                </ButtonMenu>
            ) : null}
        </div>
    )
);

export default themr("header", styles)(HeaderActions);
