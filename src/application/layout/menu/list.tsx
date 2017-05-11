import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {MenuItem, MenuItemConfig, MenuStyle, styles} from "./item";
export {MenuStyle, styles};

export interface MenuProps {
    activeRoute?: string;
    brand?: string;
    menus: MenuItemConfig[];
    theme?: MenuStyle;
}

export interface MenuListProps extends MenuProps {
    onSelectMenu?: (evt: React.SyntheticEvent<HTMLDivElement> | undefined, idx: number) => void;
}

@themr("menu", styles)
@observer
export class MenuList extends React.Component<MenuListProps, void> {

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
