import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Button, {ButtonProps} from "focus-components/button";

import * as styles from "./__style__/menu.css";
export {styles};

export type MenuStyle = Partial<typeof styles>;

export interface MenuItemConfig extends ButtonProps {
    route: string;
    showLabel?: boolean;
    subMenus?: MenuItemConfig[];
}

export interface MenuItemProps extends MenuItemConfig {
    activeRoute?: string;
    theme?: MenuStyle;
}

@themr("menu", styles)
@observer
@autobind
export class MenuItem extends React.Component<MenuItemProps, void> {

    render(): JSX.Element {
        const {activeRoute, label, icon, iconLibrary, showLabel, onClick, route, theme} = this.props;
        const buttonProps = {...{icon: "link", shape: showLabel ? null : "icon" as "icon"}, label, icon, iconLibrary, onClick};
        return (
            <li className={`${theme!.item} ${route === activeRoute ? theme!.active! : ""}`}>
                <Button {...buttonProps} color={route === activeRoute ? "primary" : undefined} />
            </li>
        );
    }
}
