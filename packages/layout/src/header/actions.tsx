import {motion} from "framer-motion";

import {CSSProp, getDefaultTransition, getIcon, useTheme} from "@focus4/styling";
import {Button, ButtonMenu, ButtonProps, MenuItem, MenuItemProps, Tooltip, TooltipProps} from "@focus4/toolbox";

import headerCss from "./__style__/header.css";

/** Action principale, affichée dans son propre bouton. */
export type PrimaryAction = ButtonProps & {
    /** A renseigner pour poser une tooltip autour du bouton. */
    tooltip?: Omit<TooltipProps, "children">;
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
    theme?: CSSProp<{
        actions?: string;
    }>;
}

/** Barre d'actions du header. */
export function HeaderActions({
    i18nPrefix = "focus",
    primary = [],
    secondary = [],
    secondaryButton = {},
    theme: pTheme
}: HeaderActionsProps) {
    const theme = useTheme("header", headerCss, pTheme);
    return (
        <motion.div
            className={theme.actions()}
            transition={getDefaultTransition()}
            variants={{
                visible: {
                    y: "0%",
                    opacity: 1
                },
                hidden: {
                    y: "-50%",
                    opacity: 0.3
                }
            }}
        >
            {primary.map((action, i) => {
                const button = (
                    <Button key={`${i}`} floating {...action} icon={getIcon(action.icon, action.iconCustom ?? false)} />
                );

                if (action.tooltip) {
                    return (
                        <Tooltip key={`${i}`} {...action.tooltip}>
                            {button}
                        </Tooltip>
                    );
                } else {
                    return button;
                }
            })}
            {secondary.length > 0 ? (
                <ButtonMenu
                    button={{
                        floating: true,
                        ...secondaryButton,
                        icon: secondaryButton.icon
                            ? getIcon(secondaryButton.icon, secondaryButton.iconCustom ?? false)
                            : getIcon(`${i18nPrefix}.icons.headerActions.secondary`)
                    }}
                    position="topRight"
                >
                    {secondary.map((action, i) => (
                        <MenuItem key={`${i}`} {...action} icon={getIcon(action.icon, action.iconCustom ?? false)} />
                    ))}
                </ButtonMenu>
            ) : null}
        </motion.div>
    );
}
