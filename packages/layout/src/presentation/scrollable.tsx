import classNames from "classnames";
import {AnimatePresence, motion} from "framer-motion";
import {range} from "lodash";
import {useObserver} from "mobx-react";
import {ReactElement, ReactNode, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {CSSProp, useTheme} from "@focus4/styling";
import {FloatingActionButton} from "@focus4/toolbox";

import {OverlayContext, ScrollableContext} from "../utils";

import {Overlay} from "./overlay";

import scrollableCss, {ScrollableCss} from "./__style__/scrollable.css";
export {scrollableCss};
export type {ScrollableCss};

export interface ScrollableProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 300. */
    backToTopOffset?: number;
    /** Children. */
    children?: ReactNode;
    /** Classe CSS. */
    className?: string;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** Si renseigné, affiche également l'overlay des `Popin` et des `Dialog` au dessus du `Scrollable`. */
    showOverlay?: boolean;
    /** Reset le scroll (à 0) dès que les children du scrollable changent.  */
    resetScrollOnChildrenChange?: boolean;
    /** CSS. */
    theme?: CSSProp<ScrollableCss>;
}

/**
 * Le composant **`Scrollable`**, qui pose un **`ScrollableContext`**, est le composant central du système de présentation et mise en page de Focus.
 *
 * C'est un composant que vous n'utiliserez jamais directement (où alors avec une très bonne raison), mais il est posé par le [`Layout`](/docs/mise-en-page-layout--docs) et la [`Popin`](/docs/mise-en-page-popin--docs), qui sont des constituants basiques de votre application.
 *
 * Le `Scrollable` permet de :
 *
 * - Savoir si un élément est visible à l'écran (via un [`IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)), ce qui permet de gérer le scroll infini des listes, où bien afficher l'élement en cours dans le [`ScrollspyContainer`](/docs/mise-en-page-scrollspycontainer--docs)
 * - Gérer un "portal" vers l'élément racine, pour poser des popins par exemple.
 * - Poser un bouton de retour vers le haut une fois qu'on a scrollé un peu.
 *
 * Le `Scrollable` **pose son propre contexte de scroll sur la page**. En particulier, pour celui du [`Layout`](/docs/mise-en-page-layout--docs), il faut bien comprendre que le scroll général de l'application n'est pas celui de le page mais celui du `Scrollable` qui prend 100% de l'espace de l'écran (sauf la partie dédiée au [`MainMenu`](/docs/mise-en-page-menu-principal--docs) s'il y'en a un). Il faut bien prendre cela en compte lorsque vous essaierez de personnaliser le CSS général de votre application.
 */
export function Scrollable({
    backToTopOffset = 300,
    className,
    children,
    hideBackToTop = false,
    scrollBehaviour = "smooth",
    showOverlay = false,
    resetScrollOnChildrenChange,
    theme: pTheme
}: ScrollableProps) {
    const theme = useTheme("scrollable", scrollableCss, pTheme);

    const overlay = useContext(OverlayContext);
    const level = useContext(ScrollableContext).level + 1;

    const containerNode = useRef<HTMLDivElement>(null);
    const scrollableNode = useRef<HTMLDivElement>(null);

    const intersectionObserver = useRef<IntersectionObserver>();
    const [onIntersects] = useState(() => new Map<Element, (ratio: number, isIntersecting: boolean) => void>());

    useLayoutEffect(() => {
        intersectionObserver.current = new IntersectionObserver(
            entries =>
                entries.forEach(e => {
                    const onIntersect = onIntersects.get(e.target);
                    if (onIntersect) {
                        onIntersect(Math.round(e.intersectionRatio * 100) / 100, e.isIntersecting);
                    }
                }),
            {root: scrollableNode.current, threshold: range(0, 102.5, 2.5).map(t => t / 100)}
        );
    }, []);

    const registerIntersect = useCallback(function registerIntersect(
        node: HTMLElement,
        onIntersect: (ratio: number, isIntersecting: boolean) => void
    ) {
        if (intersectionObserver.current) {
            onIntersects.set(node, onIntersect);
            intersectionObserver.current.observe(node);
        }

        return () => {
            if (intersectionObserver.current) {
                onIntersects.delete(node);
                intersectionObserver.current.unobserve(node);
            }
        };
    },
    []);

    const portal = useCallback(function portal(node: ReactElement) {
        if (containerNode.current) {
            return createPortal(node, containerNode.current);
        } else {
            return null!;
        }
    }, []);

    const scrollTo = useCallback(
        function scrollTo(options?: ScrollToOptions) {
            if (scrollableNode.current) {
                scrollableNode.current.scrollTo({behavior: scrollBehaviour, ...options});
            }
        },
        [scrollBehaviour]
    );

    useLayoutEffect(() => {
        if (resetScrollOnChildrenChange) {
            scrollTo({top: 0, behavior: "auto"});
        }
    }, [children, resetScrollOnChildrenChange]);

    const [hasBackToTop, setHasBackToTop] = useState(false);
    useLayoutEffect(() => {
        function onScroll() {
            setHasBackToTop((scrollableNode.current?.scrollTop ?? 0) > backToTopOffset);
        }

        scrollableNode.current?.addEventListener("scroll", onScroll);
        return () => scrollableNode.current?.removeEventListener("scroll", onScroll);
    }, [backToTopOffset]);

    const [headerHeight, setHeaderHeight] = useState(0);

    return useObserver(() => (
        <ScrollableContext.Provider
            value={useMemo(
                () => ({
                    headerHeight,
                    level,
                    setHeaderHeight,
                    portal,
                    registerIntersect,
                    scrollTo
                }),
                [headerHeight, portal, registerIntersect, scrollTo]
            )}
        >
            <div ref={containerNode} className={classNames(theme.container(), className)}>
                <div ref={scrollableNode} className={theme.scrollable()}>
                    {children}
                </div>
                <AnimatePresence>
                    {!hideBackToTop && hasBackToTop ? (
                        <motion.div
                            animate={{scale: 1}}
                            className={theme.backToTop()}
                            exit={{scale: 0}}
                            initial={{scale: 0}}
                        >
                            <FloatingActionButton
                                color="accent"
                                icon="expand_less"
                                onClick={() => scrollTo({top: 0})}
                            />
                        </motion.div>
                    ) : undefined}
                </AnimatePresence>
                {showOverlay ? <Overlay active={overlay.activeLevel >= level} close={overlay.close} /> : null}
            </div>
        </ScrollableContext.Provider>
    ));
}
