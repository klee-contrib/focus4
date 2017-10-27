import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {MenuStyle, styles} from "./item";
export {MenuStyle, styles};

/** Props du Menu. */
export interface MenuProps {
    /** Route active. */
    activeRoute?: string;
    /** Menu. */
    children?: React.ReactChildren;
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
        const {onSelectMenu} = this.props;
        if (onSelectMenu) {
            onSelectMenu(evt, idx);
        }
    }

    render() {
        const {activeRoute, children, theme} = this.props;
        return (
            <ul className={theme!.list}>
                {React.Children.map(children, (menuItem: React.ReactElement<any>, idx) => (
                    <li
                        className={`${theme!.item} ${menuItem.props && menuItem.props.route === activeRoute ? theme!.active : ""}`}
                        key={idx}
                        onClick={(evt: any) => this.onClick(evt, idx)}
                    >
                        {menuItem}
                    </li>
                ))}
            </ul>
        );
    }
}

export default themr("menu", styles)(MenuList);
