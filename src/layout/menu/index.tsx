import {action, computed, observable} from "mobx";
import * as React from "react";
import {findDOMNode} from "react-dom";
import {IconButtonTheme} from "react-toolbox/lib/button";

import {themr} from "../../theme";

import {MainMenuItem, MainMenuItemProps} from "./item";
import {MainMenuList, MainMenuListStyle} from "./list";
import {MainMenuPanel, MainMenuPanelStyle} from "./panel";

export {MainMenuItem};

import * as styles from "./__style__/menu.css";
export type MainMenuStyle = Partial<typeof styles> & IconButtonTheme;
const Theme = themr("mainMenu", styles);

/** Props du Menu. */
export interface MainMenuProps {
    activeRoute?: string;
    theme?: MainMenuListStyle & MainMenuPanelStyle & {menu?: string};
}

/** Composant de menu, à instancier soi-même avec les items que l'on veut dedans. */
export class MainMenu extends React.Component<MainMenuProps> {
    /** Largeur du menu. */
    @observable menuWidth = 0;
    /** Index du sous-menu actif. */
    @observable activeMenuIndex?: number;
    /** Position du sous-menu actif */
    @observable yPosition = 0;
    /** Affiche le sous menu (ou pas) */
    @observable showPanel = false;

    /** Récupère le sous-menu actif. */
    @computed
    get subMenu() {
        const activeMenuItem =
            (this.activeMenuIndex !== undefined &&
                (React.Children.toArray(this.props.children).filter(x => x)[this.activeMenuIndex] as React.ReactElement<
                    MainMenuItemProps
                >)) ||
            undefined;
        return (activeMenuItem && activeMenuItem.props && activeMenuItem.props.children) || undefined;
    }

    /**
     * Handler de clic sur un menu pour ouvrir (ou pas) le sous-menu associé.
     * @param evt Evènement HTML.
     * @param menuIndex Index du menu.
     */
    @action.bound
    private onSelectMenu(evt: React.MouseEvent<HTMLLIElement>, menuIndex: number) {
        const targetPosition = evt.currentTarget.getBoundingClientRect();
        this.showPanel = this.activeMenuIndex !== menuIndex || !this.showPanel;
        this.activeMenuIndex = menuIndex;
        this.yPosition = targetPosition.top;
    }

    // Permet de récupérer et d'actualiser la largeur du menu à l'exécution.
    componentDidMount() {
        this.menuWidth = (findDOMNode(this) as Element).clientWidth;
        window.addEventListener("resize", this.componentDidUpdate);
    }

    @action.bound
    componentDidUpdate() {
        this.menuWidth = (findDOMNode(this) as Element).clientWidth;
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.componentDidUpdate);
    }

    render() {
        const {activeRoute, children} = this.props;
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <nav className={theme.menu}>
                        <MainMenuList activeRoute={activeRoute} onSelectMenu={this.onSelectMenu} theme={theme}>
                            {children}
                        </MainMenuList>
                        <MainMenuPanel
                            close={() => (this.showPanel = false)}
                            opened={!!(this.showPanel && this.activeMenuIndex !== undefined && this.subMenu)}
                            xOffset={this.menuWidth || 0}
                            yOffset={this.yPosition}
                            theme={theme}
                        >
                            <MainMenuList activeRoute={activeRoute} theme={theme}>
                                {this.subMenu}
                            </MainMenuList>
                        </MainMenuPanel>
                    </nav>
                )}
            </Theme>
        );
    }
}
