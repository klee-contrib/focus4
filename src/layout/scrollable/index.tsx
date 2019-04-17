import "intersection-observer";

import ResizeObserver from "@juggle/resize-observer";
import {range} from "lodash";
import {action, observable} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import React from "react";
import {createPortal} from "react-dom";
import {Transition} from "react-pose";

import {ScrollableContext} from "../../components";
import {themr} from "../../theme";

import {ButtonBackToTop} from "./button-back-to-top";
export {ButtonBackToTopStyle} from "./button-back-to-top";

import * as styles from "../__style__/scrollable.css";
const Theme = themr("scrollable", styles);
export type ScrollableStyle = Partial<typeof styles>;

@observer
export class Scrollable extends React.Component<{
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 200. */
    backToTopOffset?: number;
    /** Classe CSS. */
    className?: string;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS. */
    theme?: ScrollableStyle;
}> {
    header?: [JSX.Element, Element];
    stickyHeader?: HTMLElement | null;
    @observable isHeaderSticky = false;

    @observable.ref intersectionObserver!: IntersectionObserver;
    @observable.ref resizeObserver!: ResizeObserver;

    node!: HTMLDivElement | null;
    stickyNode!: HTMLDivElement | null;

    readonly onScrolls = observable<(top: number, height: number) => void>([], {deep: false});
    readonly onIntersects = observable.map<Element, (ratio: number, isIntersecting: boolean) => void>([], {
        deep: false
    });

    @observable hasBtt = false;
    @observable width = 0;
    @observable headerHeight = 0;

    /** @see ScrollableContext.registerHeader */
    @action.bound
    registerHeader(node: JSX.Element, element: Element, canDeploy = true) {
        if (canDeploy) {
            this.intersectionObserver.observe(element);
        }
        this.isHeaderSticky = !canDeploy;
        this.header = [node, element];
        return () => {
            if (canDeploy) {
                this.intersectionObserver.unobserve(element);
            }
            this.isHeaderSticky = false;
            this.header = undefined;
        };
    }

    /** @see ScrollableContext.registerIntersect */
    @action.bound
    registerIntersect(node: HTMLElement, onIntersect: (ratio: number, isIntersecting: boolean) => void) {
        this.onIntersects.set(node, onIntersect);
        this.intersectionObserver.observe(node);

        return () => {
            this.onIntersects.delete(node);
            this.intersectionObserver.unobserve(node);
        };
    }

    /** @see ScrollableContext.registerScroll */
    @action.bound
    registerScroll(onScroll: (top: number, height: number) => void) {
        this.onScrolls.push(onScroll);

        if (this.node) {
            onScroll(this.node.scrollTop + this.headerHeight, this.node.clientHeight);
        }

        return () => this.onScrolls.remove(onScroll);
    }

    /** @see ScrollableContext.scrollTo */
    @action.bound
    scrollTo(options?: ScrollToOptions) {
        const {scrollBehaviour = "smooth"} = this.props;
        this.node!.scrollTo({behavior: scrollBehaviour, ...options});
    }

    /** @see ScrollableContext.sticky */
    @action.bound
    sticky(node: JSX.Element) {
        return createPortal(node, this.stickyNode!);
    }

    /** Permet de n'afficher le bouton que si le scroll a dépassé l'offset. */
    @disposeOnUnmount
    bttScroll = this.registerScroll(top => (this.hasBtt = top > (this.props.backToTopOffset || 200)));

    componentDidMount() {
        this.node!.addEventListener("scroll", this.onScroll);
        this.resizeObserver = new ResizeObserver(() => this.onScroll());
        this.resizeObserver.observe(this.node!);
        this.intersectionObserver = new IntersectionObserver(
            entries =>
                entries.forEach(e => {
                    if (this.header && e.target === this.header[1]) {
                        this.isHeaderSticky = !e.isIntersecting;
                    }
                    const onIntersect = this.onIntersects.get(e.target);
                    if (onIntersect) {
                        onIntersect(e.intersectionRatio, e.isIntersecting);
                    }
                }),
            {root: this.node, threshold: range(0, 105, 5).map(t => t / 100)}
        );
    }

    componentWillUnmount() {
        if (this.node) {
            this.node.removeEventListener("scroll", this.onScroll);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
    }

    @action.bound
    onScroll() {
        this.width = this.node!.clientWidth;
        this.headerHeight = (this.stickyHeader && this.stickyHeader.clientHeight) || 0;
        this.onScrolls.forEach(onScroll => onScroll(this.node!.scrollTop + this.headerHeight, this.node!.clientHeight));
    }

    render() {
        const {children, className, hideBackToTop} = this.props;
        return (
            <ScrollableContext.Provider
                value={{
                    registerHeader: this.registerHeader,
                    registerIntersect: this.registerIntersect,
                    registerScroll: this.registerScroll,
                    scrollTo: this.scrollTo,
                    sticky: this.sticky
                }}
            >
                <Theme theme={this.props.theme}>
                    {theme => (
                        <div className={`${className || ""} ${theme.container}`}>
                            <Transition>
                                {this.isHeaderSticky && this.header
                                    ? React.cloneElement(this.header[0], {
                                          ref: (stickyHeader: any) => (this.stickyHeader = stickyHeader),
                                          key: "header",
                                          style: {width: this.width}
                                      })
                                    : undefined}
                                <div
                                    key="sticky"
                                    className={theme.sticky}
                                    ref={div => (this.stickyNode = div)}
                                    style={{width: this.width, top: this.headerHeight}}
                                />
                                <div key="scrollable" className={theme.scrollable} ref={div => (this.node = div)}>
                                    {this.intersectionObserver ? children : null}
                                </div>
                                {!hideBackToTop && this.hasBtt ? <ButtonBackToTop key="backtotop" /> : undefined}
                            </Transition>
                        </div>
                    )}
                </Theme>
            </ScrollableContext.Provider>
        );
    }
}
export function Sticky({
    parentNode: node,
    children,
    placeholder
}: {
    parentNode: HTMLElement | null;
    children: JSX.Element;
    placeholder?: JSX.Element;
}) {
    const context = React.useContext(ScrollableContext);
    const [condition, setCondition] = React.useState(false);
    React.useLayoutEffect(() => context.registerScroll(top => node && setCondition(top >= node.offsetTop)), [node]);
    return condition ? (
        <>
            {context.sticky(children)}
            {placeholder}
        </>
    ) : (
        children
    );
}
