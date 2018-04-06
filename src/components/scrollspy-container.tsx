import scroll from "smoothscroll-polyfill";
scroll.polyfill();

import i18next from "i18next";
import {sortBy, uniqueId} from "lodash";
import {action, computed, observable, untracked} from "mobx";
import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";
import {themr} from "react-css-themr";
import {findDOMNode} from "react-dom";

import ButtonBackToTop from "./button-back-to-top";
import {PanelDescriptor} from "./panel";

import * as styles from "./__style__/scrollspy-container.css";

export type ScrollspyStyle = Partial<typeof styles>;

/** Props du ScrollspyContainer. */
export interface ScrollspyContainerProps {
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Offset de scroll à partir du moment ou le menu devient fixe, par rapport au header. Par défaut : toutes les marges qui vont bien. */
    menuOffset?: number;
    /** Largeur du menu. Par défaut : 250. */
    menuWidth?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** Offset entre la position du panel et la position de scroll au clic sur le menu. Par défaut : 150. */
    scrollToOffset?: number;
    /** CSS. */
    theme?: ScrollspyStyle;
}

/** Container pour une page de détail avec plusieurs Panels. Affiche un menu de navigation sur la gauche. */
@observer
export class ScrollspyContainer extends React.Component<ScrollspyContainerProps, void> {

    /** Offset entre le container et le haut du document. */
    @observable private offsetTop = 0;
    /** Scroll courant. */
    @observable private scrollTop = 0;

    /** Map des panels qui se sont enregistrés dans le container. */
    private readonly panels = observable.map<string, PanelDescriptor>();

    static childContextTypes = {
        header: PropTypes.object,
        layout: PropTypes.object,
        scrollspy: PropTypes.object
    };

    static contextTypes = {
        layout: PropTypes.object,
        header: PropTypes.object
    };

    context!: {
        layout: {
            contentPaddingTop: number
        }
        header: {
            marginBottom: number,
            topRowHeight: number
        }
    };

    /** On définit les méthodes que l'on passe aux enfants. */
    getChildContext() {
        return {
            header: this.context.header,
            layout: this.context.layout,
            scrollspy: {
                registerPanel: this.registerPanel,
                removePanel: this.removePanel,
                updatePanel: this.updatePanel
            }
        };
    }

    /**
     * Enregistre un panel dans le container et retourne son id.
     * @param panel La description d'un panel
     */
    @action.bound
    private registerPanel(panel: PanelDescriptor) {
        const id = uniqueId("ssc-panel");
        this.panels.set(id, panel);
        return id;
    }

    /**
     * Retire un panel du container.
     * @param id L'id du panel.
     */
    @action.bound
    private removePanel(id: string) {
        this.panels.delete(id);
    }

    /**
     * Met à jour un panel.
     * @param id L'id du panel.
     * @param panel La description du panel.
     */
    @action.bound
    private updatePanel(id: string, panel: PanelDescriptor) {
        this.panels.set(id, panel);
    }

    componentDidMount() {
        window.addEventListener("scroll", this.onScroll);
        window.addEventListener("resize", this.onScroll);
        this.onScroll();
    }

    componentDidUpdate() {
        this.onScroll();
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.onScroll);
        window.removeEventListener("resize", this.onScroll);
    }

    /** Synchronise le scroll/resize de la page avec les observables qui les représentent. */
    @action.bound
    private onScroll() {
        this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        this.offsetTop = findDOMNode(this)
            .getBoundingClientRect().top;
    }

    /** Récupère les panels triés par position dans la page. */
    @computed.struct
    private get sortedPanels() {
        return sortBy(Array.from(this.panels.entries()), (([_, {node}]) => this.getOffsetTop(node)));
    }

    /** Récupère les items du menu à partir des panels enregistrés. */
    @computed.struct
    private get menuItems() {
        return this.sortedPanels.map(([id, {node, title}]) => ({
            id,
            label: title && i18next.t(title),
            onClick: () => this.scrollTo(node)
        }));
    }

    /** Détermine le panel actif dans le menu */
    @computed.struct
    private get activeItem() {
        const active = this.sortedPanels.slice()
            .reverse()
            .find(([_, {node}]) => this.getOffsetTop(node) <= this.scrollTop);
        return active && active[0] || this.sortedPanels[0] && this.sortedPanels[0][0];
    }

    /** Détermine la position du menu (absolue avant menuOffset, fixe après) */
    @computed.struct
    private get menuPosition() {
        const {menuOffset = this.context.header.topRowHeight + this.context.header.marginBottom + this.context.layout.contentPaddingTop} = this.props;
        const isFixed = this.offsetTop < menuOffset;
        return {
            position: isFixed ? "fixed" as "fixed" : "absolute" as "absolute",
            top: isFixed ? menuOffset : 0
        };
    }

    /**
     * Récupère l'offset d'un noeud HTML (un panel) par rapport au top du document.
     * @param node Le noeud HTML.
     */
    private getOffsetTop(node: HTMLElement) {
        return untracked(() => { // Il y a un bug très bizarre qui fait planter tout MobX à cause de l'accès à la prop, donc on met un untracked pour le contourner.
            let distance = 0;

            if (node.offsetParent) {
                do {
                    distance += node.offsetTop;
                    node = node.offsetParent as HTMLElement;
                } while (node);
            }

            return (distance < 0 ? 0 : distance) - (this.props.scrollToOffset || 150);
        });
    }

    /**
     * Scrolle la page vers le noeud demandé.
     * @param node Le noeud cible.
     */
    private scrollTo(node: HTMLDivElement) {
        window.scrollTo({
            top: this.getOffsetTop(node),
            behavior: this.props.scrollBehaviour || "smooth"
        });
    }

    render() {
        const {children, hideBackToTop, menuWidth = 250, scrollBehaviour = "smooth", theme} = this.props;
        return (
            <div className={theme!.scrollspy}>
                <nav style={this.menuPosition}>
                    <ul>
                        {this.menuItems.map(({label, id, onClick}) =>
                            <li className={this.activeItem === id ? theme!.active : undefined} key={id} onClick={onClick}>{label}</li>
                        )}
                    </ul>
                </nav>
                <div className={theme!.content} style={{marginLeft: menuWidth}}>
                    {children}
                </div>
                {!hideBackToTop ? <ButtonBackToTop scrollBehaviour={scrollBehaviour} /> : null}
            </div>
        );
    }
}

export default themr("scrollspy", styles)(ScrollspyContainer);
