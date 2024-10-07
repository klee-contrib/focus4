import classNames from "classnames";
import {AnimatePresence, motion} from "framer-motion";
import {range} from "lodash";
import {ReactElement, ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {CSSProp, useTheme} from "@focus4/styling";
import {FloatingActionButton} from "@focus4/toolbox";

import {ScrollableContext} from "../utils";

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
    /** Reset le scroll (à 0) dès que les children du scrollable changent.  */
    resetScrollOnChildrenChange?: boolean;
    /** CSS. */
    theme?: CSSProp<ScrollableCss>;
}

export function Scrollable({
    backToTopOffset = 300,
    className,
    children,
    hideBackToTop = false,
    scrollBehaviour = "smooth",
    resetScrollOnChildrenChange,
    theme: pTheme
}: ScrollableProps) {
    const theme = useTheme("scrollable", scrollableCss, pTheme);

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
    return (
        <ScrollableContext.Provider
            value={useMemo(
                () => ({
                    headerHeight,
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
            </div>
        </ScrollableContext.Provider>
    );
}
