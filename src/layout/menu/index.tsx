import {autobind} from "core-decorators";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {IconButtonTheme} from "react-toolbox/lib/button";

import MainMenuItem, {MainMenuItemProps} from "./item";
import MainMenuList, {MainMenuListStyle} from "./list";
import MainMenuPanel, {MainMenuPanelStyle} from "./panel";

export {MainMenuItem};

import * as styles from "./__style__/menu.css";

export type MainMenuStyle = Partial<typeof styles> & IconButtonTheme;

/** Props du Menu. */
export interface MainMenuProps {
    activeRoute?: string;
    theme?: MainMenuListStyle & MainMenuPanelStyle & {menu?: string};
}

/** Composant de menu, à instancier soi-même avec les items que l'on veut dedans. */
@observer
@autobind
export class MainMenu extends React.Component<MainMenuProps, void> {

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
        const activeMenuItem = this.activeMenuIndex && React.Children.toArray(this.props.children)[this.activeMenuIndex] as React.ReactElement<MainMenuItemProps> || undefined;
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
                <MainMenuList
                    activeRoute={activeRoute}
                    onSelectMenu={this.onSelectMenu}
                    theme={theme}
                >
                    {this.props.children}
                </MainMenuList>
                <MainMenuPanel
                    close={() => this.showPanel = false}
                    opened={!!(this.showPanel && this.activeMenuIndex !== undefined && this.subMenu)}
                    xOffset={this.menuWidth}
                    yOffset={this.yPosition}
                    theme={theme}
                >
                    <MainMenuList
                        activeRoute={activeRoute}
                        theme={theme}
                    >
                        {this.subMenu}
                    </MainMenuList>
                </MainMenuPanel>
            </nav>
        );
    }
}

export default themr("mainMenu", styles)(MainMenu);
