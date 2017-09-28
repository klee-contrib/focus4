import {autobind} from "core-decorators";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {classAutorun} from "../../util";

import {MenuItemConfig} from "./item";
import MenuList, {MenuProps, MenuStyle, styles} from "./list";
import MenuPanel from "./panel";

export {MenuItemConfig, MenuStyle};

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

    /** Eléments du sous-menu actif. */
    private readonly subMenus = observable<MenuItemConfig>([]);

    /** Met à jour les éléments du sous-menu actif. */
    @classAutorun updateSubMenus() {
        const {menus} = this.props;
        // Si le menu actif à un sous-menu, alors on enregistre ses éléments.
        if (this.activeMenuIndex !== undefined && menus[this.activeMenuIndex].subMenus) {
            this.subMenus.replace(menus[this.activeMenuIndex].subMenus!);
        } else {
            this.subMenus.clear(); // Sinon on vide.
        }
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
                    opened={!!(this.showPanel && this.activeMenuIndex !== undefined && menus[this.activeMenuIndex].subMenus)}
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

export default themr("menu", styles)(Menu);
