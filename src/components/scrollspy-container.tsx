import i18next from "i18next";
import {sortBy, uniqueId} from "lodash";
import {action, computed, observable, untracked} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import * as React from "react";

import {themr} from "../theme";

import {PanelDescriptor} from "./panel";
import {ScrollableContext, Sticky} from "./scrollable";

import * as styles from "./__style__/scrollspy-container.css";
export type ScrollspyStyle = Partial<typeof styles>;
const Theme = themr("scrollspy", styles);

/** Props du ScrollspyContainer. */
export interface ScrollspyContainerProps {
    /** Menu personnalisé pour le scrollspy. */
    MenuComponent?: React.ComponentType<ScrollspyMenuProps>;
    /** Offset de scroll à partir du moment ou le menu devient fixe, par rapport au header. Par défaut : toutes les marges qui vont bien. */
    menuOffset?: number;
    /** Largeur du menu. Par défaut : 250. */
    menuWidth?: number;
    /** Offset entre la position du panel et la position de scroll au clic sur le menu. Par défaut : 150. */
    scrollToOffset?: number;
    /** CSS. */
    theme?: ScrollspyStyle;
}

export const ScrollspyContext = React.createContext({
    registerPanel: (() => "") as ScrollspyContainer["registerPanel"],
    removePanel: (() => null) as ScrollspyContainer["removePanel"],
    updatePanel: (() => null) as ScrollspyContainer["updatePanel"]
});

/** Container pour une page de détail avec plusieurs Panels. Affiche un menu de navigation sur la gauche. */
@observer
export class ScrollspyContainer extends React.Component<ScrollspyContainerProps> {
    static contextType = ScrollableContext;
    context!: React.ContextType<typeof ScrollableContext>;

    /** Offset entre le container et le haut du document. */
    @observable protected offsetTop = 0;
    /** Scroll courant. */
    @observable protected scrollTop = 0;

    /** Map des panels qui se sont enregistrés dans le container. */
    protected readonly panels = observable.map<string, PanelDescriptor>();
    node!: HTMLDivElement | null;
    @observable paddingLeft!: string;

    /**
     * Enregistre un panel dans le container et retourne son id.
     * @param panel La description d'un panel
     */
    @action.bound
    protected registerPanel(panel: PanelDescriptor, sscId?: string) {
        sscId = sscId || uniqueId("ssc-panel");
        this.panels.set(sscId, panel);
        return sscId;
    }

    /**
     * Retire un panel du container.
     * @param id L'id du panel.
     */
    @action.bound
    protected removePanel(id: string) {
        this.panels.delete(id);
    }

    /**
     * Met à jour un panel.
     * @param id L'id du panel.
     * @param panel La description du panel.
     */
    @action.bound
    protected updatePanel(id: string, panel: PanelDescriptor) {
        this.panels.set(id, panel);
    }

    /** Synchronise le scroll/resize de la page avec les observables qui les représentent. */
    @disposeOnUnmount
    scrollListener = this.context.registerScroll(
        action((top: number) => {
            this.scrollTop = top;
            if (this.node) {
                this.offsetTop = this.node.getBoundingClientRect().top;
                this.paddingLeft = window.getComputedStyle(this.node.parentElement!).paddingLeft!;
            }
        })
    );

    /** Récupère les panels triés par position dans la page. */
    @computed.struct
    protected get sortedPanels() {
        return sortBy(Array.from(this.panels.entries()), ([_, {node}]) => this.getOffsetTop(node));
    }

    /** Détermine le panel actif dans le menu */
    @computed.struct
    protected get activeItem() {
        const active = this.sortedPanels
            .slice()
            .reverse()
            .find(([_, {node}]) => this.getOffsetTop(node) <= this.scrollTop);
        return (active && active[0]) || (this.sortedPanels[0] && this.sortedPanels[0][0]);
    }

    /** Détermine la position du menu (absolue avant menuOffset, fixe après) */
    @computed.struct
    protected get isSticky() {
        const {
            menuOffset = this.context.header.topRowHeight +
                this.context.header.marginBottom +
                this.context.layout.contentPaddingTop
        } = this.props;
        return this.scrollTop !== 0 && this.offsetTop < menuOffset;
    }

    /**
     * Récupère l'offset d'un noeud HTML (un panel) par rapport au top du document.
     * @param node Le noeud HTML.
     */
    protected getOffsetTop(node: HTMLElement) {
        return untracked(() => {
            // Il y a un bug très bizarre qui fait planter tout MobX à cause de l'accès à la prop, donc on met un untracked pour le contourner.
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
     * Scrolle la page vers le panel demandé.
     * @param sscId Le panel cible.
     */
    @action.bound
    scrollToPanel(sscId: string) {
        const panel = this.panels.get(sscId);
        if (panel) {
            this.context.scrollTo({top: this.getOffsetTop(panel.node)});
        }
    }

    render() {
        const {
            children,
            MenuComponent = ScrollspyMenu,
            menuOffset = this.context.header.topRowHeight +
                this.context.header.marginBottom +
                this.context.layout.contentPaddingTop,
            menuWidth = 250
        } = this.props;
        return (
            <ScrollspyContext.Provider
                value={{
                    registerPanel: this.registerPanel,
                    removePanel: this.removePanel,
                    updatePanel: this.updatePanel
                }}
            >
                <Theme theme={this.props.theme}>
                    {theme => (
                        <div ref={node => (this.node = node)} className={theme.scrollspy}>
                            <Sticky condition={this.isSticky}>
                                <nav
                                    className={theme.menu}
                                    style={{
                                        top: this.isSticky ? menuOffset : 0,
                                        left: this.isSticky ? this.paddingLeft : undefined
                                    }}
                                >
                                    <MenuComponent
                                        activeClassName={theme.active}
                                        activeId={this.activeItem}
                                        panels={this.sortedPanels.map(([id, {title}]) => ({
                                            id,
                                            title: (title && i18next.t(title)) || ""
                                        }))}
                                        scrollToPanel={this.scrollToPanel}
                                    />
                                </nav>
                            </Sticky>
                            <div className={theme.content} style={{marginLeft: menuWidth}}>
                                {children}
                            </div>
                        </div>
                    )}
                </Theme>
            </ScrollspyContext.Provider>
        );
    }
}

/** Props du ScrollspyMenu. */
export interface ScrollspyMenuProps {
    /** Id du panel actif. */
    activeId: string;
    /** Classe CSS à ajouter pour le panel actif. */
    activeClassName?: string;
    /** Liste des panels. */
    panels: {title: string; id: string}[];
    /** Fonction pour scroller vers un panel. */
    scrollToPanel: (id: string) => void;
}

/** Menu par défaut pour le ScrollspyContainer. */
export function ScrollspyMenu({activeId, activeClassName, panels, scrollToPanel}: ScrollspyMenuProps) {
    return (
        <ul>
            {panels.map(({title, id}) => (
                <li
                    className={activeId === id ? activeClassName : undefined}
                    key={id}
                    onClick={() => scrollToPanel(id)}
                >
                    {title}
                </li>
            ))}
        </ul>
    );
}
