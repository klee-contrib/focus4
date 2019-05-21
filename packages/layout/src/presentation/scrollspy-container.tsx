import i18next from "i18next";
import {max, sortBy} from "lodash";
import {action, computed, observable, ObservableMap} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {PanelDescriptor, ScrollableContext, ScrollspyContext} from "@focus4/components";
import {themr} from "@focus4/styling";

import scrollspyStyles from "./__style__/scrollspy-container.css";
export {scrollspyStyles};
export type ScrollspyStyle = Partial<typeof scrollspyStyles>;
const Theme = themr("scrollspy", scrollspyStyles);

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

/** Container pour une page de détail avec plusieurs Panels. Affiche un menu de navigation sur la gauche. */
@observer
export class ScrollspyContainer extends React.Component<ScrollspyContainerProps> {
    static contextType: any = ScrollableContext;
    context!: React.ContextType<typeof ScrollableContext>;

    /** Noeud DOM du scrollspy */
    node = React.createRef<HTMLDivElement>();

    /** Map des panels qui se sont enregistrés dans le container. */
    protected readonly panels: ObservableMap<
        string,
        PanelDescriptor & {ratio: number; disposer: () => void}
    > = observable.map();

    /** @see ScrollspyContext.registerPanel */
    @action.bound
    protected registerPanel(name: string, panel: PanelDescriptor) {
        // Le panel ne sera pas enregistré s'il n'est pas contenu dans le scrollspy (ex: dans une popin).
        if (!this.node.current!.contains(panel.node)) {
            return;
        }

        if (this.panels.has(name)) {
            panel.node = panel.node;
            panel.title = panel.title;
        } else {
            this.panels.set(name, {
                ...panel,
                ratio: 0,
                disposer: this.context.registerIntersect(panel.node, ratio => (this.panels.get(name)!.ratio = ratio))
            });
        }
        return () => {
            this.panels.get(name)!.disposer();
            this.panels.delete(name);
        };
    }

    /** Récupère les panels triés par position dans la page. */
    @computed.struct
    protected get sortedPanels() {
        return sortBy(Array.from(this.panels.entries()), ([_, {node}]) => this.getOffsetTop(node));
    }

    /** Détermine le panel actif dans le menu */
    @computed.struct
    protected get activeItem() {
        const maxRatio = max(this.sortedPanels.map(([_, {ratio}]) => ratio));
        const panel = this.sortedPanels.find(([_, {ratio}]) => ratio === maxRatio);
        return (panel && panel[0]) || (this.sortedPanels[0] && this.sortedPanels[0][0]);
    }

    /**
     * Récupère l'offset d'un noeud HTML (un panel) par rapport au top du document.
     * @param node Le noeud HTML.
     */
    protected getOffsetTop(node: HTMLElement) {
        const distance = node.offsetTop + (this.node.current!.offsetTop || 0);
        return (distance < 0 ? 0 : distance) - (this.props.scrollToOffset || 150);
    }

    /**
     * Scrolle la page vers le panel demandé.
     * @param name Le panel cible.
     */
    @action.bound
    scrollToPanel(name: string) {
        const panel = this.panels.get(name);
        if (panel) {
            this.context.scrollTo({top: this.getOffsetTop(panel.node)});
        }
    }

    render() {
        const {children, MenuComponent = ScrollspyMenu, menuWidth = 250} = this.props;
        return (
            <ScrollspyContext.Provider value={{registerPanel: this.registerPanel}}>
                <Theme theme={this.props.theme}>
                    {theme => (
                        <div ref={this.node} className={theme.scrollspy}>
                            {this.context.portal(
                                <nav className={theme.menu} key="scrollspy">
                                    <MenuComponent
                                        activeClassName={theme.active}
                                        activeId={this.activeItem}
                                        panels={this.sortedPanels.map(([id, {title}]) => ({
                                            id,
                                            title: (title && i18next.t(title)) || ""
                                        }))}
                                        scrollToPanel={this.scrollToPanel}
                                    />
                                </nav>,
                                this.node.current
                            )}
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
                    id={`menu-${id}`}
                    onClick={() => scrollToPanel(id)}
                >
                    {title}
                </li>
            ))}
        </ul>
    );
}
