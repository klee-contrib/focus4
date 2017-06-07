import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import MenuItem, {MenuItemConfig, MenuStyle, styles} from "./item";
export {MenuStyle, styles};

/** Props du Menu. */
export interface MenuProps {
    /** Route active. */
    activeRoute?: string;
    /** Classe CSS du logo, placé en haut du menu. */
    brand?: string;
    /** Menu. */
    menus: MenuItemConfig[];
    /** CSS. */
    theme?: MenuStyle;
}

/** Props du MenuList. */
export interface MenuListProps extends MenuProps {
    /** Handler de clic sur un item. */
    onSelectMenu?: (evt: React.SyntheticEvent<HTMLDivElement> | undefined, idx: number) => void;
}

/** Liste d'item de menu. */
@observer
export class MenuList extends React.Component<MenuListProps, void> {

    /** Handler de clic, appelle le handler du menu (pour ouvrir le panel) puis celui de l'item. */
    private onClick(evt: React.SyntheticEvent<HTMLDivElement> | undefined, idx: number) {

        if (this.props.onSelectMenu) {
            this.props.onSelectMenu(evt, idx);
        }

        const {onClick} = this.props.menus[idx];
        if (onClick) {
            onClick(evt);
        }
    }
    render() {
        const {menus, theme} = this.props;
        return (
            <ul className={theme!.list}>
                {menus.map((menu, idx) => (
                    <MenuItem
                        key={menu.route}
                        {...menu}
                        activeRoute={this.props.activeRoute}
                        onClick={evt => this.onClick(evt, idx)}
                    />
                ))}
            </ul>
        );
    }
}

export default themr("menu", styles)(MenuList);
