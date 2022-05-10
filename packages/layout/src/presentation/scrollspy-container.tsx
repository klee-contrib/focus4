import i18next from "i18next";
import {max, sortBy} from "lodash";
import {action, computed, makeObservable, observable, ObservableMap} from "mobx";
import {observer} from "mobx-react";
import {Component, ComponentType, ContextType, createRef, ReactNode} from "react";

import {CSSProp, PanelDescriptor, ScrollableContext, ScrollspyContext, themr} from "@focus4/styling";

import scrollspyCss, {ScrollspyCss} from "./__style__/scrollspy.css";
export {scrollspyCss, ScrollspyCss};
const Theme = themr("scrollspy", scrollspyCss);

/** Props du ScrollspyContainer. */
export interface ScrollspyContainerProps {
    /** Children */
    children?: ReactNode;
    /** Menu personnalisé pour le scrollspy. */
    MenuComponent?: ComponentType<ScrollspyMenuProps>;
    /** Menu rétractable. */
    retractable?: boolean;
    /** CSS. */
    theme?: CSSProp<ScrollspyCss>;
}

/** Container pour une page de détail avec plusieurs Panels. Affiche un menu de navigation sur la gauche. */
@observer
export class ScrollspyContainer extends Component<ScrollspyContainerProps> {
    static contextType: any = ScrollableContext;
    declare context: ContextType<typeof ScrollableContext>;

    /** Noeud DOM du scrollspy */
    node = createRef<HTMLDivElement>();

    /** Map des panels qui se sont enregistrés dans le container. */
    protected readonly panels: ObservableMap<string, PanelDescriptor & {ratio: number; disposer: () => void}> =
        observable.map();

    constructor(props: ScrollspyContainerProps) {
        super(props);
        makeObservable(this);
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
        return panel?.[0] ?? this.sortedPanels[0]?.[0];
    }

    /**
     * Récupère l'offset d'un noeud HTML (un panel) par rapport au top du document.
     * @param node Le noeud HTML.
     */
    protected getOffsetTop(node: HTMLElement) {
        return node.offsetTop - (this.node.current!.offsetTop || 0);
    }

    /** @see ScrollspyContext.registerPanel */
    @action.bound
    protected registerPanel(name: string, panel: PanelDescriptor) {
        // Le panel ne sera pas enregistré s'il n'est pas contenu dans le scrollspy (ex: dans une popin).
        if (!this.node.current!.contains(panel.node)) {
            return;
        }

        if (!this.panels.has(name)) {
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
        const {children, retractable = true, MenuComponent = ScrollspyMenu} = this.props;
        return (
            // eslint-disable-next-line react/jsx-no-constructed-context-values
            <ScrollspyContext.Provider value={{registerPanel: this.registerPanel}}>
                <Theme theme={this.props.theme}>
                    {theme => (
                        <div ref={this.node} className={theme.scrollspy()}>
                            {this.context.menu(
                                <nav key="scrollspy" className={theme.menu()}>
                                    <MenuComponent
                                        activeClassName={theme.active()}
                                        activeId={this.activeItem}
                                        panels={this.sortedPanels.map(([id, {title}]) => ({
                                            id,
                                            title: (title && i18next.t(title)) || ""
                                        }))}
                                        scrollToPanel={this.scrollToPanel}
                                    />
                                </nav>,
                                this.node.current,
                                retractable
                            )}
                            <div className={theme.content()}>{children}</div>
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
                    key={id}
                    className={activeId === id ? activeClassName : undefined}
                    id={`menu-${id}`}
                    onClick={() => scrollToPanel(id)}
                >
                    {title}
                </li>
            ))}
        </ul>
    );
}
