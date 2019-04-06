import i18next from "i18next";
import {maxBy, sortBy, uniqueId} from "lodash";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
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

    /** Noeud DOM du scrollspy */
    node!: HTMLDivElement | null;

    /** Map des panels qui se sont enregistrés dans le container. */
    protected readonly panels = observable.map<string, PanelDescriptor & {ratio: number; disposer: () => void}>();

    /**
     * Enregistre un panel dans le container et retourne son id.
     * @param panel La description d'un panel
     */
    @action.bound
    protected registerPanel(panel: PanelDescriptor, sscId?: string) {
        sscId = sscId || uniqueId("ssc-panel");
        this.panels.set(sscId, {
            ...panel,
            ratio: 0,
            disposer: this.context.registerIntersect(panel.node, ratio => (this.panels.get(sscId!)!.ratio = ratio))
        });
        return sscId;
    }

    /**
     * Retire un panel du container.
     * @param id L'id du panel.
     */
    @action.bound
    protected removePanel(id: string) {
        this.panels.get(id)!.disposer();
        this.panels.delete(id);
    }

    /**
     * Met à jour un panel.
     * @param id L'id du panel.
     * @param desc La description du panel.
     */
    @action.bound
    protected updatePanel(id: string, desc: PanelDescriptor) {
        const panel = this.panels.get(id)!;
        panel.node = desc.node;
        panel.title = desc.title;
    }

    /** Récupère les panels triés par position dans la page. */
    @computed.struct
    protected get sortedPanels() {
        return sortBy(Array.from(this.panels.entries()), ([_, {node}]) => this.getOffsetTop(node));
    }

    /** Détermine le panel actif dans le menu */
    @computed.struct
    protected get activeItem() {
        const panel = maxBy(Array.from(this.panels.entries()), ([_, {ratio}]) => ratio);
        return (panel && panel[0]) || (this.sortedPanels[0] && this.sortedPanels[0][0]);
    }

    /**
     * Récupère l'offset d'un noeud HTML (un panel) par rapport au top du document.
     * @param node Le noeud HTML.
     */
    protected getOffsetTop(node: HTMLElement) {
        const distance = node.offsetTop + this.node!.offsetTop;
        return (distance < 0 ? 0 : distance) - (this.props.scrollToOffset || 150);
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
        const {children, MenuComponent = ScrollspyMenu, menuWidth = 250} = this.props;
        return (
            <ScrollspyContext.Provider
                value={{
                    registerPanel: this.registerPanel,
                    removePanel: this.removePanel,
                    updatePanel: this.updatePanel
                }}
            >
                <Theme ref={node => (this.node = node)} theme={this.props.theme}>
                    {theme => (
                        <div className={theme.scrollspy}>
                            <Sticky parentNode={this.node}>
                                <nav className={theme.menu}>
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
