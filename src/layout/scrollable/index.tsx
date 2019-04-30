import "intersection-observer";

import {memoize, range} from "lodash";
import {action, autorun, observable} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import {spring, styler} from "popmotion";
import React from "react";
import {createPortal, findDOMNode} from "react-dom";
import {Transition} from "react-pose";
import ResizeObserverPolyfill from "resize-observer-polyfill";
import {Styler} from "stylefire";

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
    containerNode!: HTMLDivElement;
    scrollableNode!: HTMLDivElement;
    stickyNode!: HTMLDivElement;

    @observable.ref intersectionObserver!: IntersectionObserver;
    @observable.ref resizeObserver!: ResizeObserverPolyfill;

    readonly onIntersects = observable.map<Element, (ratio: number, isIntersecting: boolean) => void>([], {
        deep: false
    });
    readonly stickyStylers = new Map<React.Key, Styler>();
    readonly stickyParentNodes = new Map<React.Key, HTMLElement>();

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
                    this.stickyParentNodes.get(key)!.offsetTop -
                    this.scrollableNode.scrollTop -
                    this.stickyNode.offsetTop
            });
        }
    });

    componentDidMount() {
        this.containerNode = findDOMNode(this) as HTMLDivElement;
        this.scrollableNode.addEventListener("scroll", this.onScroll);
        this.resizeObserver = new ResizeObserver(() => this.onScroll());
        this.resizeObserver.observe(this.scrollableNode);
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
            {root: this.scrollableNode, threshold: range(0, 105, 5).map(t => t / 100)}
        );
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
        this.hasBtt = this.scrollableNode.scrollTop + this.headerHeight > (this.props.backToTopOffset || 200);

        if (!isIEorEdge()) {
            this.stickyStylers.forEach((stickyRef, key) => {
                const parentNode = this.stickyParentNodes.get(key)!;
                stickyRef.set({
                    top: Math.max(0, parentNode.offsetTop - this.scrollableNode.scrollTop - this.stickyNode.offsetTop)
                });
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
                    this.stickyStylers.forEach((stickyRef, key) => {
                        const parentNode = this.stickyParentNodes.get(key)!;
                        stickyRef.set({
                            top: Math.max(0, parentNode.offsetTop - this.scrollableNode.scrollTop - top)
                        });
                    });
                }
            });

            if (isIEorEdge()) {
                this.stickyStylers.forEach((stickyRef, key) => {
                    const parentNode = this.stickyParentNodes.get(key)!;
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
                                    ref={div => div && (this.scrollableNode = div)}
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
