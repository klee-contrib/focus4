import * as React from "react";

import {themr} from "../../theme";

import * as styles from "./__style__/menu.css";
const Theme = themr("mainMenu", styles);

export interface MainMenuListStyle {
    active?: string;
    item?: string;
    list?: string;
}

/** Props du MenuList. */
export interface MainMenuListProps {
    /** Route active. */
    activeRoute?: string;
    /** Handler de clic sur un item. */
    onSelectMenu?: (evt: React.MouseEvent<HTMLLIElement>, idx: number) => void;
    /** CSS. */
    theme?: MainMenuListStyle;
}

/** Liste d'item de menu. */
export class MainMenuList extends React.Component<MainMenuListProps> {

    /** Handler de clic, appelle le handler du menu (pour ouvrir le panel) puis celui de l'item. */
    private onClick(evt: React.MouseEvent<HTMLLIElement>, idx: number) {
        const {onSelectMenu} = this.props;
        if (onSelectMenu) {
            onSelectMenu(evt, idx);
        }
    }

    render() {
        const {activeRoute, children} = this.props;
        return (
            <Theme theme={this.props.theme}>
                {theme =>
                    <ul className={theme.list}>
                        {React.Children.map(children, (menuItem: any, idx) => (
                            <li
                                className={`${theme.item} ${menuItem.props && menuItem.props.route === activeRoute ? theme.active : ""}`}
                                key={idx}
                                onClick={evt => this.onClick(evt, idx)}
                            >
                                {menuItem}
                            </li>
                        ))}
                    </ul>
                }
            </Theme>
        );
    }
}
