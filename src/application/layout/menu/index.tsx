import {autobind} from "core-decorators";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {classAutorun} from "../../../util";

import {MenuItemConfig} from "./item";
import {MenuList, MenuProps, MenuStyle, styles} from "./list";
import {MenuPanel} from "./panel";

export {MenuItemConfig, MenuStyle};

@themr("menu", styles)
@observer
@autobind
export class Menu extends React.Component<MenuProps, void> {

    @observable activeMenuIndex?: number;
    @observable menuWidth = 0;
    @observable yPosition = 0;
    @observable showPanel = false;

    private readonly subMenus = observable<MenuItemConfig>([]);

    @classAutorun updateSubMenus() {
        const {menus} = this.props;
        if (this.activeMenuIndex && menus[this.activeMenuIndex].subMenus) {
            this.subMenus.replace(menus[this.activeMenuIndex].subMenus!);
        } else {
            this.subMenus.clear();
        }
    }

    @action
    private onSelectMenu(evt: React.SyntheticEvent<HTMLDivElement>, menuIndex: number) {
        const targetPosition = evt.currentTarget.getBoundingClientRect();
        this.showPanel = this.activeMenuIndex !== menuIndex || !this.showPanel;
        this.activeMenuIndex = menuIndex;
        this.yPosition = targetPosition.top;
    }

    componentDidMount() { this.getMenuWidth(); }
    componentDidUpdate() { this.getMenuWidth(); }
    getMenuWidth() {
        this.menuWidth = document.getElementsByTagName("nav")[0].clientWidth;
    }

    render() {
        const {activeRoute, brand, menus, theme} = this.props;
        return (
            <nav className={theme!.menu}>
                <div className={brand} />
                <MenuList
                    onSelectMenu={this.onSelectMenu}
                    {...this.props}
                />
                <MenuPanel
                    close={() => this.showPanel = false}
                    opened={!!(this.showPanel && this.activeMenuIndex && menus[this.activeMenuIndex].subMenus)}
                    xOffset={this.menuWidth}
                    yOffset={this.yPosition}
                    theme={theme}
                >
                    <MenuList
                        activeRoute={activeRoute}
                        menus={this.subMenus}
                        theme={theme}
                    />
                </MenuPanel>
            </nav>
        );
    }
}
