import {motion} from "framer-motion";

import {CSSProp, getDefaultTransition, getIcon, useTheme} from "@focus4/styling";
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

/** Barre d'actions du header. */
export function HeaderActions({
    i18nPrefix = "focus",
    primary = [],
    secondary = [],
    secondaryButton = {},
    theme: pTheme
}: HeaderActionsProps) {
    const theme = useTheme("header", headerCss, pTheme);
    const menu = useMenu();
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
            })}
            {secondary.length > 0 ? (
                <div ref={menu.anchor} className={theme.secondaryActions()}>
                    <FloatingActionButton
                        {...secondaryButton}
                        icon={secondaryButton.icon ?? getIcon(`${i18nPrefix}.icons.headerActions.secondary`)}
                        onClick={menu.toggle}
                    />
                    <Menu {...menu}>
                        {secondary.map((action, i) => (
                            <MenuItem key={`${i}`} {...action} />
                        ))}
                    </Menu>
                </div>
            ) : null}
        </motion.div>
    );
}
