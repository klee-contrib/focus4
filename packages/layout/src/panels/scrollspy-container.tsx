import {sortBy} from "es-toolkit";
import {observable} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {
    ComponentType,
    ReactNode,
    Ref,
    RefObject,
    useCallback,
    useContext,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef
} from "react";
import {useTranslation} from "react-i18next";
import {tabbable} from "tabbable";

import {CSSProp, ToBem, useTheme} from "@focus4/styling";
import {FontIcon, Icon} from "@focus4/toolbox";

import {LateralMenu} from "../presentation";
import {PanelDescriptor, ScrollableContext, ScrollspyContext} from "../utils";

import scrollspyCss, {ScrollspyCss} from "./__style__/scrollspy.css";

export {scrollspyCss};
export type {ScrollspyCss};

/** Props du ScrollspyContainer. */
export interface ScrollspyContainerProps {
    /** Children */
    children?: ReactNode;
    /** Ref vers le div de contenu. */
    contentRef?: RefObject<HTMLDivElement | null>;
    /** Menu personnalisé pour le scrollspy. */
    MenuComponent?: ComponentType<ScrollspyMenuProps>;
    /**
     * Surcharge du 'top' pour le 'position: sticky' du menu et le calcul du scroll lorsqu'on clique sur le menu.
     * Par défaut calculé avec la hauteur du header.
     */
    offsetTopOverride?: number;
    /** Ref pour accéder à `scrollToPanel`. */
    ref?: Ref<ScrollspyContainerRef>;
    /** Menu rétractable. */
    retractable?: boolean;
    /** CSS. */
    theme?: CSSProp<ScrollspyCss>;
}

/** Ref du ScrollSpyContainer. */
export interface ScrollspyContainerRef {
    /**
     * Scrolle vers le panel demandé.
     * @param name Id du panel.
     * @param focus Pour essayer de focus le panel ciblé.
     */
    scrollToPanel: (name: string, focus?: boolean) => void;
}

/**
 * Le `ScrollspyContainer` est un composant du mise en page qui permet d'affiche un menu sur la gauche qui recapitule les titres de tous les [`Panel`](/docs/mise-en-page-panel--docs) posés à l'intérieur, avec la possibilité de naviguer vers eux en cliquant dessus.
 */
export function ScrollspyContainer({
    children,
    contentRef,
    MenuComponent = ScrollspyMenu,
    offsetTopOverride,
    ref,
    retractable = true,
    theme: pTheme
}: ScrollspyContainerProps) {
    const {t} = useTranslation();

    const theme = useTheme("scrollspy", scrollspyCss, pTheme);
    const {headerHeight, registerIntersect, scrollTo} = useContext(ScrollableContext);
    const innerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        state.headerHeight = offsetTopOverride ?? headerHeight;
    }, [headerHeight, offsetTopOverride]);
    const state = useLocalObservable(() => ({
        headerHeight: offsetTopOverride ?? headerHeight,
        panels: observable.map<string, PanelDescriptor & {ratio: number; disposer: () => void}>(),
        get sortedPanels() {
            return sortBy([...state.panels.entries()], [([_, {node}]) => getOffsetTop(node)]);
        },
        get activeItem() {
            const panels = sortBy(state.sortedPanels, [([_, {ratio}]) => -(ratio >= 0.95 ? 1 : ratio)]);
            return panels[0]?.[0];
        }
    }));

    const scrollSpyContext = useMemo(
        () => ({
            registerPanel(name: string, panel: PanelDescriptor) {
                // Le panel ne sera pas enregistré s'il n'est pas contenu dans le scrollspy (ex: dans une popin).
                if (!innerRef.current!.contains(panel.node)) {
                    return;
                }

                if (!state.panels.has(name)) {
                    state.panels.set(name, {
                        ...panel,
                        ratio: 0,
                        disposer: registerIntersect(
                            panel.node,
                            (ratio: number) => (state.panels.get(name)!.ratio = ratio)
                        )
                    });
                }
                return () => {
                    state.panels.get(name)?.disposer();
                    state.panels.delete(name);
                };
            }
        }),
        []
    );

    const scrollToPanel = useCallback(function scrollToPanel(name: string, focus = false) {
        const panel = state.panels.get(name);
        if (panel) {
            scrollTo({top: getOffsetTop(panel.node, state.headerHeight)});
            const focusables = tabbable(panel.node);
            if (focus && focusables.length > 0) {
                focusables[0].focus({preventScroll: true});
            }
        }
    }, []);

    useImperativeHandle(ref, () => ({scrollToPanel}), [scrollTo]);

    return useObserver(() => (
        <div ref={innerRef} className={theme.scrollspy()}>
            <ScrollspyContext.Provider value={scrollSpyContext}>
                <MenuComponent
                    activeId={state.activeItem}
                    headerHeight={state.headerHeight}
                    panels={state.sortedPanels.map(([id, {title, icon}]) => ({
                        id,
                        title: (title && t(title)) ?? "",
                        icon
                    }))}
                    retractable={retractable}
                    scrollToPanel={scrollToPanel}
                    theme={theme}
                />
                <div ref={contentRef} className={theme.content()}>
                    {children}
                </div>
            </ScrollspyContext.Provider>
        </div>
    ));
}

/**
 * Récupère l'offset d'un noeud HTML (un panel) par rapport au top du document.
 * @param node Le noeud HTML.
 * @param headerHeight La hauteur du header top row.
 */
function getOffsetTop(node: HTMLElement, headerHeight = 0) {
    const cpt = getComputedStyle(document.documentElement).getPropertyValue("--content-padding-top");
    const padding = +cpt.slice(0, -2);
    return (
        node.offsetTop +
        ((node.offsetParent as HTMLElement)?.offsetTop ?? 0) -
        headerHeight -
        (Number.isNaN(padding) ? 0 : padding)
    );
}

/** Props du ScrollspyMenu. */
export interface ScrollspyMenuProps {
    /** Id du panel actif. */
    activeId: string;
    /** Taille du header, pour le 'position: sticky'. */
    headerHeight: number;
    /** Liste des panels. */
    panels: {title: string; id: string; icon?: Icon}[];
    /** Menu rétractable. */
    retractable?: boolean;
    /**
     * Scrolle vers le panel demandé.
     * @param name Id du panel.
     * @param focus Pour essayer de focus le panel ciblé.
     */
    scrollToPanel: (id: string, focus?: boolean) => void;
    /** CSS. */
    theme: ToBem<ScrollspyCss>;
}

/** Menu par défaut pour le ScrollspyContainer. */
export function ScrollspyMenu({
    activeId,
    headerHeight,
    panels,
    retractable = true,
    scrollToPanel,
    theme
}: ScrollspyMenuProps) {
    return (
        <LateralMenu headerHeight={headerHeight} retractable={retractable}>
            <nav className={theme.menu()}>
                <ul>
                    {panels.map(({title, id, icon}) => (
                        <li
                            key={id}
                            className={activeId === id ? theme.active() : undefined}
                            id={`menu-${id}`}
                            onClick={() => scrollToPanel(id)}
                            onKeyUp={e => {
                                if (e.code === "Enter") {
                                    scrollToPanel(id, true);
                                }
                            }}
                            tabIndex={0}
                        >
                            <span>
                                {icon ? <FontIcon className={theme.icon()} icon={icon} /> : null}
                                {title}
                            </span>
                        </li>
                    ))}
                </ul>
            </nav>
        </LateralMenu>
    );
}
