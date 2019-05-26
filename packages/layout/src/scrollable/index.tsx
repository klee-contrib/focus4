import "intersection-observer";

import {debounce, memoize, range} from "lodash";
import {action, autorun, computed, observable} from "mobx";
import {disposeOnUnmount, observer, Observer} from "mobx-react";
import {ColdSubscription, spring, styler} from "popmotion";
import React from "react";
import {createPortal, findDOMNode} from "react-dom";
import {Transition} from "react-pose";
import ResizeObserverPolyfill from "resize-observer-polyfill";
import {Styler} from "stylefire";

import {ScrollableContext, springPose, themr} from "@focus4/styling";

import {ButtonBackToTop} from "./button-back-to-top";
export {ButtonBackToTopStyle, buttonBTTStyles} from "./button-back-to-top";

import scrollableStyles from "./__style__/scrollable.css";
export {scrollableStyles};
const Theme = themr("scrollable", scrollableStyles);
export type ScrollableStyle = Partial<typeof scrollableStyles>;

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill;

export interface ScrollableProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 300. */
    backToTopOffset?: number;
    /** Children. */
    children?: React.ReactNode;
    /** Classe CSS. */
    className?: string;
    /** @internal */
    /** Ref vers le div container. */
    innerRef?: React.Ref<HTMLDivElement>;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** Reset le scroll (à 0) dès que les children du scrollable changent.  */
    resetScrollOnChildrenChange?: boolean;
    /** CSS. */
    theme?: ScrollableStyle;
}

@observer
class ScrollableComponent extends React.Component<ScrollableProps> {
    @observable.ref header?: {
        Header: React.ElementType;
        headerProps: React.HTMLProps<HTMLElement>;
        nonStickyElement: HTMLElement;
        canDeploy: boolean;
    };
    @observable.ref containerNode!: HTMLDivElement;
    @observable.ref scrollableNode!: HTMLDivElement;
    @observable.ref stickyNode!: HTMLDivElement;
    @observable.ref stickyHeader: HTMLElement | null = null;

    @observable.ref intersectionObserver!: IntersectionObserver;
    @observable.ref resizeObserver!: ResizeObserverPolyfill;

    readonly onIntersects = observable.map<Element, (ratio: number, isIntersecting: boolean) => void>([], {
        deep: false
    });
    readonly stickyStylers = observable.map<React.Key, Styler>({}, {deep: false});
    readonly stickyParentNodes = observable.map<React.Key, HTMLElement>({}, {deep: false});

    @observable hasBtt = false;
    @observable headerHeight = 0;
    @observable isHeaderSticky = false;
    @observable width = 0;

    @computed
    get stickyOffsetTop() {
        return this.isHeaderSticky ? this.stickyNode.offsetTop : 0;
    }

    /** @see ScrollableContext.registerHeader */
    @action.bound
    registerHeader(
        Header: React.ElementType,
        headerProps: React.HTMLProps<HTMLElement>,
        nonStickyElement: HTMLElement,
        canDeploy = true
    ) {
        if (canDeploy) {
            this.intersectionObserver.observe(nonStickyElement);
        } else {
            styler(this.stickyNode).set({top: this.headerHeight});
        }
        this.isHeaderSticky = !canDeploy;
        this.header = {Header, headerProps, nonStickyElement, canDeploy};
        return () => {
            if (canDeploy) {
                this.intersectionObserver.unobserve(nonStickyElement);
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

    /** @see ScrollableContext.scrollTo */
    @action.bound
    scrollTo(options?: ScrollToOptions) {
        const {scrollBehaviour = "smooth"} = this.props;
        this.scrollableNode.scrollTo({behavior: scrollBehaviour, ...options});
    }

    /** @see ScrollableContext.portal */
    @action.bound
    portal(node: JSX.Element, parentNode?: HTMLElement | null) {
        if (parentNode) {
            if (!node.key) {
                throw new Error("Un élément sticky doit avoir une key.");
            }
            this.stickyParentNodes.set(node.key, parentNode);
            return createPortal(React.cloneElement(node, {ref: this.setRef(node.key)}), this.stickyNode);
        } else {
            return createPortal(node, this.containerNode);
        }
    }

    setRef = memoize((key: React.Key) => (ref: HTMLElement | null) => {
        if (!ref && this.stickyStylers.has(key)) {
            this.stickyStylers.delete(key);
            this.stickyParentNodes.delete(key);
        } else if (ref && !this.stickyStylers.has(key)) {
            const stickyRef = styler(ref);
            this.stickyStylers.set(key, stickyRef);
            stickyRef.set({
                top:
                    getOffsetTop(this.stickyParentNodes.get(key)!, this.scrollableNode) -
                    this.scrollableNode.scrollTop -
                    this.stickyOffsetTop
            });
        }
    });

    componentWillReceiveProps(props: ScrollableProps) {
        if (props.resetScrollOnChildrenChange && props.children !== this.props.children) {
            this.scrollTo({top: 0, behavior: "auto"});
        }
    }

    componentDidMount() {
        this.containerNode = findDOMNode(this) as HTMLDivElement;
        this.scrollableNode.addEventListener("scroll", this.onScroll);
        this.resizeObserver = new ResizeObserver(() => this.onScroll());
        this.resizeObserver.observe(this.scrollableNode);
        this.intersectionObserver = new IntersectionObserver(
            entries =>
                entries.forEach(e => {
                    if (this.header && e.target === this.header.nonStickyElement) {
                        this.isHeaderSticky = !e.isIntersecting;
                    }
                    const onIntersect = this.onIntersects.get(e.target);
                    if (onIntersect) {
                        onIntersect(e.intersectionRatio, e.isIntersecting);
                    }
                }),
            {root: this.scrollableNode, threshold: range(0, 105, 5).map(t => t / 100)}
        );
        styler(this.stickyNode).set({top: this.headerHeight});
    }

    componentWillUnmount() {
        if (this.scrollableNode) {
            this.scrollableNode.removeEventListener("scroll", this.onScroll);
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
        this.width = this.scrollableNode.clientWidth;
        this.hasBtt = this.scrollableNode.scrollTop + this.headerHeight > (this.props.backToTopOffset || 300);
        if (isIEorEdge()) {
            this.onScrollCoreDebounced();
        } else {
            this.onScrollCore();
        }
    }

    onScrollCoreDebounced = debounce(() => this.onScrollCore(), 50);
    onScrollCore() {
        if (!isIEorEdge()) {
            this.setStickyRefs(this.stickyOffsetTop);
        } else {
            this.animateStickyRefs(
                parentOffsetTop => parentOffsetTop - this.scrollableNode.scrollTop - this.stickyOffsetTop
            );
        }
    }

    stickySpring?: ColdSubscription;

    @disposeOnUnmount
    followHeader = autorun(() => {
        if (!this.stickyNode) {
            return;
        }

        const sticky = styler(this.stickyNode);
        const from = sticky.get("top");
        const to = this.isHeaderSticky ? this.headerHeight : 0;
        if (this.header && from !== to) {
            if (this.stickySpring) {
                this.stickySpring.stop();
            }
            if (this.header.canDeploy) {
                this.stickySpring = spring({...springPose.transition, from, to}).start((top: number) => {
                    sticky.set({top});
                    this.setStickyRefs(top);
                    if (isIEorEdge()) {
                        this.onScrollCoreDebounced.cancel();
                    }
                });
            } else {
                sticky.set({top: to});
                this.setStickyRefs(to);
            }
        }

        if (isIEorEdge()) {
            if (this.isHeaderSticky) {
                this.animateStickyRefs(() => 0);
            }
        }
    });

    setStickyRefs(offsetTop: number) {
        this.stickyStylers.forEach((stickyRef, key) => {
            const parentNode = this.stickyParentNodes.get(key)!;
            stickyRef.set({
                top: Math.max(
                    0,
                    getOffsetTop(parentNode, this.scrollableNode) - this.scrollableNode.scrollTop - offsetTop
                )
            });
        });
    }

    animateStickyRefs(to: (parentOffsetTop: number) => number) {
        this.stickyStylers.forEach((stickyRef, key) => {
            const parentNode = this.stickyParentNodes.get(key)!;
            const transition = {
                from: stickyRef.get("top"),
                to: Math.max(0, to(getOffsetTop(parentNode, this.scrollableNode)))
            };
            if (transition.from !== transition.to) {
                spring({...springPose.transition, ...transition}).start((top: number) => {
                    stickyRef.set({
                        top
                    });
                });
            }
        });
    }

    @disposeOnUnmount
    setHeaderHeight = autorun(() => {
        if (this.stickyHeader && this.isHeaderSticky) {
            const marginBottom = window.getComputedStyle(this.stickyHeader).marginBottom || "0px";
            this.headerHeight = this.stickyHeader.clientHeight + +marginBottom.substring(0, marginBottom.length - 2);
        } else {
            this.headerHeight = 0;
        }
    });

    setStickyHeader = (ref: HTMLElement | null) => (this.stickyHeader = ref);

    render() {
        const {children, className, hideBackToTop, innerRef} = this.props;
        return (
            <ScrollableContext.Provider
                value={{
                    registerHeader: this.registerHeader,
                    registerIntersect: this.registerIntersect,
                    scrollTo: this.scrollTo,
                    portal: this.portal
                }}
            >
                <Theme theme={this.props.theme}>
                    {theme => (
                        <div ref={innerRef} className={`${className || ""} ${theme.container}`}>
                            <div className={theme.scrollable} ref={div => div && (this.scrollableNode = div)}>
                                {this.intersectionObserver ? children : null}
                            </div>
                            <div
                                className={theme.sticky}
                                ref={div => div && (this.stickyNode = div)}
                                style={{width: this.width}}
                            />
                            <Observer>
                                {() => {
                                    const {Header = null, headerProps = {}} = this.header || {};
                                    return (
                                        <Transition>
                                            {Header && this.isHeaderSticky ? (
                                                <Header
                                                    {...headerProps}
                                                    key={headerProps.key || "header"}
                                                    ref={this.setStickyHeader}
                                                    style={{width: this.width}}
                                                />
                                            ) : (
                                                undefined
                                            )}
                                            {!hideBackToTop && this.hasBtt ? (
                                                <ButtonBackToTop key="back-to-top" />
                                            ) : (
                                                undefined
                                            )}
                                        </Transition>
                                    );
                                }}
                            </Observer>
                        </div>
                    )}
                </Theme>
            </ScrollableContext.Provider>
        );
    }
}

export const Scrollable = React.forwardRef<HTMLDivElement, React.PropsWithChildren<ScrollableProps>>((props, ref) => (
    <ScrollableComponent {...props} innerRef={ref} />
));

function isIEorEdge() {
    return navigator.userAgent.match(/(Trident|Edge)/);
}

function getOffsetTop(node: HTMLElement, container: HTMLElement) {
    let distance = node.offsetTop;
    if (node.offsetParent && node.offsetParent !== container) {
        distance += getOffsetTop(node.offsetParent as HTMLElement, container);
    }
    return distance;
}
