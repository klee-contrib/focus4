import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";
import {MENU} from "react-toolbox/lib/identifiers";
import {IconMenu as IconMenuType, iconMenuFactory, IconMenuProps, IconMenuTheme} from "react-toolbox/lib/menu/IconMenu";
import {Menu as MenuType, menuFactory, MenuProps, MenuTheme} from "react-toolbox/lib/menu/Menu";
import {MenuDivider as RTMenuDivider, MenuDividerProps, MenuDividerTheme} from "react-toolbox/lib/menu/MenuDivider";
import {MenuItem as MenuItemType, menuItemFactory, MenuItemProps, MenuItemTheme} from "react-toolbox/lib/menu/MenuItem";

import {useTheme} from "@focus4/styling";
import rtMenuTheme from "react-toolbox/components/menu/theme.css";
const menuTheme: MenuTheme = rtMenuTheme;
export {menuTheme};

import {Button, ButtonProps, IconButton} from "./button";
import {rippleFactory} from "./ripple";
import {tooltipFactory, TooltipProps} from "./tooltip";

const RTMenuItem = menuItemFactory(rippleFactory({}));
export const MenuItem = React.forwardRef<MenuItemType, MenuItemProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme as MenuItemTheme, props.theme);
    return <RTMenuItem ref={ref} {...props} theme={theme} />;
});

const RTMenu = menuFactory(MenuItem);
export const Menu = React.forwardRef<MenuType, MenuProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme, props.theme);
    return <RTMenu ref={ref} {...props} theme={theme} />;
});

const RTIconMenu = iconMenuFactory(IconButton, Menu);
export const IconMenu = React.forwardRef<IconMenuType, IconMenuProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme as IconMenuTheme, props.theme);
    return <RTIconMenu ref={ref} {...props} theme={theme} />;
});

export const MenuDivider = React.forwardRef<RTMenuDivider, MenuDividerProps>((props, ref) => {
    const theme = useTheme(MENU, menuTheme as MenuDividerTheme, props.theme);
    return <RTMenuDivider ref={ref} {...props} theme={theme} />;
});

const TooltipButton = tooltipFactory()(Button);

/** Props du ButtonMenu, qui est un simple menu React-Toolbox avec un bouton personnalisable. */
export interface ButtonMenuProps extends MenuProps {
    /** Les props du bouton. */
    button: ButtonProps &
        TooltipProps & {
            /** L'icône à afficher quand le bouton est ouvert. */
            openedIcon?: React.ReactNode;
        };
}

/** Menu React-Toolbox avec un bouton personnalisable (non icône). */
@observer
export class ButtonMenu extends React.Component<ButtonMenuProps> {
    /** Menu ouvert. */
    @observable isOpened = false;
    /** Hauteur du bouton, pour placer le menu. */
    @observable buttonHeight = 0;

    private button?: React.Component<any> | null;

    // On récupère à tout instant la hauteur du bouton.
    componentDidMount() {
        if (this.button) {
            this.buttonHeight = (findDOMNode(this.button) as Element).clientHeight;
        }
    }

    componentDidUpdate() {
        if (this.button) {
            this.buttonHeight = (findDOMNode(this.button) as Element).clientHeight;
        }
    }

    /** Génère le style à passer au menu pour le positionner, en fonction de la position souhaitée et de la taille du bouton. */
    @computed.struct
    private get menuStyle() {
        const {position = "topLeft"} = this.props;
        if (position === "auto") {
            return undefined;
        }
        return {
            position: "absolute" as "absolute",
            top: position.startsWith("top") ? this.buttonHeight : undefined,
            bottom: position.startsWith("bottom") ? this.buttonHeight : undefined,
            right: position.endsWith("Right") ? 0 : undefined
        };
    }

    @action.bound
    private onClick() {
        this.isOpened = true;
        const {onClick} = this.props;
        if (onClick) {
            onClick();
        }
    }

    @action.bound
    private onHide() {
        this.isOpened = false;
        const {onHide} = this.props;
        if (onHide) {
            onHide();
        }
    }

    render() {
        const {
            button: {icon, openedIcon, ...buttonProps},
            position = "topLeft",
            ...menuProps
        } = this.props;
        const FinalButton = buttonProps.tooltip ? TooltipButton : Button;
        return (
            <div data-focus="button-menu" style={{position: "relative", display: "inline-block"}}>
                <FinalButton
                    ref={(i: any) => (this.button = i)}
                    {...buttonProps}
                    onClick={this.onClick}
                    icon={this.isOpened && openedIcon ? openedIcon : icon}
                />

                <div style={this.menuStyle}>
                    <Menu {...menuProps} position={position} active={this.isOpened} onHide={this.onHide}>
                        {menuProps.children}
                    </Menu>
                </div>
            </div>
        );
    }
}

export {MenuItemProps, MenuItemTheme, MenuProps, MenuTheme, IconMenuProps, IconMenuTheme};
