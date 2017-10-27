import {autobind} from "core-decorators";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import MenuItem, {MenuItemProps} from "./item";
import MenuList, {MenuProps, MenuStyle, styles} from "./list";
import MenuPanel from "./panel";

export {MenuItem, MenuStyle};

/** Composant de menu, à instancier soi-même avec les items que l'on veut dedans. */
@observer
@autobind
export class Menu extends React.Component<MenuProps, void> {

    /** Index du sous-menu actif. */
    @observable activeMenuIndex?: number;
    /** Largeur du menu, sera déterminé après le montage. */
    @observable menuWidth = 0;
    /** Position du sous-menu actif */
    @observable yPosition = 0;
    /** Affiche le sous menu (ou pas) */
    @observable showPanel = false;

    /** Récupère le sous-menu actif. */
    @computed
    get subMenu() {
        const activeMenuItem = this.activeMenuIndex && React.Children.toArray(this.props.children)[this.activeMenuIndex] as React.ReactElement<MenuItemProps> || undefined;
        return activeMenuItem && activeMenuItem.props && activeMenuItem.props.children || undefined;
    }

    /**
     * Handler de clic sur un menu pour ouvrir (ou pas) le sous-menu associé.
     * @param evt Evènement HTML.
     * @param menuIndex Index du menu.
     */
    @action
    private onSelectMenu(evt: React.SyntheticEvent<HTMLDivElement>, menuIndex: number) {
        const targetPosition = evt.currentTarget.getBoundingClientRect();
        this.showPanel = this.activeMenuIndex !== menuIndex || !this.showPanel;
        this.activeMenuIndex = menuIndex;
        this.yPosition = targetPosition.top;
    }

    // Permet de récupérer et d'actualiser la largeur du menu à l'exécution.
    componentDidMount() { this.getMenuWidth(); }
    componentDidUpdate() { this.getMenuWidth(); }
    getMenuWidth() {
        this.menuWidth = document.getElementsByTagName("nav")[0].clientWidth;
    }

    render() {
        const {activeRoute, theme} = this.props;
        return (
            <nav className={theme!.menu}>
                <MenuList
                    onSelectMenu={this.onSelectMenu}
                    activeRoute={activeRoute}
                >
                    {this.props.children}
                </MenuList>
                <MenuPanel
                    close={() => this.showPanel = false}
                    opened={!!(this.showPanel && this.activeMenuIndex !== undefined && this.subMenu)}
                    xOffset={this.menuWidth}
                    yOffset={this.yPosition}
                    theme={theme}
                >
                    <MenuList
                        activeRoute={activeRoute}
                        theme={theme}
                    >
                        {this.subMenu}
                    </MenuList>
                </MenuPanel>
            </nav>
        );
    }
}

export default themr("menu", styles)(Menu);
