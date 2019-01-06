import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import * as styles from "./__style__/menu.css";

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
@observer
export class MainMenuList extends React.Component<MainMenuListProps, void> {
    /** Handler de clic, appelle le handler du menu (pour ouvrir le panel) puis celui de l'item. */
    private onClick(evt: React.MouseEvent<HTMLLIElement>, idx: number) {
        const {onSelectMenu} = this.props;
        if (onSelectMenu) {
            onSelectMenu(evt, idx);
        }
    }

    render() {
        const {activeRoute, children, theme} = this.props;
        const childItems = React.Children.toArray(children);
        return (
            <ul className={theme!.list}>
                {childItems &&
                    childItems
                        .filter(x => x)
                        .map((item, idx) => (
                            <li
                                className={`${theme!.item} ${
                                    typeof item !== "string" &&
                                    typeof item !== "number" &&
                                    item.props.route === activeRoute
                                        ? theme!.active
                                        : ""
                                }`}
                                key={idx}
                                onClick={evt => this.onClick(evt, idx)}
                            >
                                {item}
                            </li>
                        ))}
            </ul>
        );
    }
}

export default themr("mainMenu", styles)(MainMenuList);
