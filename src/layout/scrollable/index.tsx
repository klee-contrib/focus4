import "intersection-observer";

import {range} from "lodash";
import {action, autorun, computed, observable} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import {spring, styler} from "popmotion";
import React from "react";
import {createPortal, findDOMNode} from "react-dom";
import {Transition} from "react-pose";
import ResizeObserverPolyfill from "resize-observer-polyfill";

import {springPose} from "../../animation";
import {ScrollableContext} from "../../components";
import {themr} from "../../theme";

import {ButtonBackToTop} from "./button-back-to-top";
export {ButtonBackToTopStyle} from "./button-back-to-top";

import * as styles from "../__style__/scrollable.css";
const Theme = themr("scrollable", styles);
export type ScrollableStyle = Partial<typeof styles>;

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill;

export interface ScrollableProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 200. */
    backToTopOffset?: number;
    /** Classe CSS. */
    className?: string;
    /** @internal */
    /** Ref vers le div container. */
    innerRef?: React.Ref<HTMLDivElement>;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** CSS. */
    theme?: ScrollableStyle;
}

@observer
class ScrollableComponent extends React.Component<ScrollableProps> {
    header?: [React.ElementType, React.HTMLProps<HTMLElement>, HTMLElement];
    node!: HTMLDivElement;
    stickyNode!: HTMLDivElement;

    @observable.ref intersectionObserver!: IntersectionObserver;
    @observable.ref resizeObserver!: ResizeObserverPolyfill;

    readonly onIntersects = observable.map<Element, (ratio: number, isIntersecting: boolean) => void>([], {
        deep: false
    });
    readonly stickies = observable.map<React.Key, [React.RefObject<HTMLElement>, HTMLElement]>(new Map(), {
        deep: false
    });

    @computed
    get stickyStylers() {
        return Array.from(this.stickies.values())
            .map(([stickyRef, parentNode]) =>
                stickyRef.current ? ([styler(stickyRef.current), parentNode] as const) : []
            )
            .filter(x => x.length);
    }

    @observable hasBtt = false;
    @observable headerHeight = 0;
    @observable isHeaderSticky = false;
    @observable width = 0;

    /** @see ScrollableContext.registerHeader */
    @action.bound
    registerHeader(
        Header: React.ElementType,
        headerProps: React.HTMLProps<HTMLElement>,
        nonStickyElement: HTMLElement,
        canDeploy?: boolean
    ) {
        if (canDeploy) {
            this.intersectionObserver.observe(nonStickyElement);
        }
        this.isHeaderSticky = !canDeploy;
        this.header = [Header, headerProps, nonStickyElement];
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
        this.node.scrollTo({behavior: scrollBehaviour, ...options});
    }

    /** @see ScrollableContext.portal */
    @action.bound
    portal(node: JSX.Element, parentNode?: HTMLElement | null) {
        if (parentNode) {
            if (!node.key) {
                throw new Error("Un élément sticky doit avoir une key.");
            }

            if (!this.stickies.has(node.key)) {
                this.stickies.set(node.key, [React.createRef(), parentNode]);
            }

            const [stickyRef] = this.stickies.get(node.key)!;

            return createPortal(React.cloneElement(node, {ref: stickyRef}), this.stickyNode);
        } else {
            return createPortal(node, findDOMNode(this) as Element);
        }
    }

    componentDidMount() {
        this.node.addEventListener("scroll", this.onScroll);
        this.resizeObserver = new ResizeObserver(() => this.onScroll());
        this.resizeObserver.observe(this.node);
        this.intersectionObserver = new IntersectionObserver(
            entries =>
                entries.forEach(e => {
                    if (this.header && e.target === this.header[2]) {
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

    initIEorEdge = false;

    @action.bound
    onScroll() {
        this.width = this.node.clientWidth;
        this.hasBtt = this.node.scrollTop + this.headerHeight > (this.props.backToTopOffset || 200);

        if (!isIEorEdge()) {
            this.stickyStylers.forEach(([stickyRef, parentNode]) => {
                stickyRef.set({
                    top: Math.max(0, parentNode.offsetTop - this.node.scrollTop - this.stickyNode.offsetTop)
                });
            });
        } else if (!this.initIEorEdge) {
            this.stickyStylers.forEach(([stickyRef, parentNode]) => {
                stickyRef.set({top: parentNode.offsetTop});
                this.initIEorEdge = true;
            });
        }
    }

    @disposeOnUnmount
    followHeader = autorun(() => {
        const transition = this.isHeaderSticky ? {from: 0, to: this.headerHeight} : {from: this.headerHeight, to: 0};
        if (transition.from !== transition.to) {
            const sticky = styler(this.stickyNode);
            spring({...springPose.transition, ...transition}).start((top: number) => {
                sticky.set({top});
                if (!isIEorEdge()) {
                    this.stickyStylers.forEach(([stickyRef, parentNode]) =>
                        stickyRef.set({
                            top: Math.max(0, parentNode.offsetTop - this.node.scrollTop - top)
                        })
                    );
                }
            });

            if (isIEorEdge()) {
                this.stickyStylers.forEach(([stickyRef, parentNode]) => {
                    const transition2 = this.isHeaderSticky
                        ? {from: parentNode.offsetTop, to: 0}
                        : {from: 0, to: parentNode.offsetTop};
                    spring({...springPose.transition, ...transition2}).start((top: number) => {
                        stickyRef.set({
                            top
                        });
                    });
                });
            }
        }
    });

    render() {
        const {children, className, hideBackToTop, innerRef} = this.props;
        const [Header = null, headerProps = null] = (this.isHeaderSticky && this.header) || [];
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
                            <Transition>
                                {Header ? (
                                    <Header
                                        {...headerProps}
                                        ref={(ref: any) => (this.headerHeight = (ref && ref.clientHeight) || 0)}
                                        key="header"
                                        style={{width: this.width}}
                                    />
                                ) : (
                                    undefined
                                )}
                                <div
                                    key="sticky"
                                    className={theme.sticky}
                                    ref={div => div && (this.stickyNode = div)}
                                    style={{width: this.width}}
                                />
                                <div
                                    key="scrollable"
                                    className={theme.scrollable}
                                    ref={div => div && (this.node = div)}
                                >
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

export const Scrollable = React.forwardRef<HTMLDivElement, React.PropsWithChildren<ScrollableProps>>((props, ref) => (
    <ScrollableComponent {...props} innerRef={ref} />
));

function isIEorEdge() {
    return navigator.userAgent.match(/(Trident|Edge)/);
}
