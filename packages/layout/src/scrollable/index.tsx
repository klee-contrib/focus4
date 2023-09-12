import classNames from "classnames";
import {AnimatePresence, HTMLMotionProps, motion} from "framer-motion";
import {memoize, range} from "lodash";
import {action, computed, IReactionDisposer, makeObservable, observable, when} from "mobx";
import {observer, useObserver} from "mobx-react";
import {cloneElement, Component, forwardRef, HTMLProps, Key, PropsWithChildren, ReactNode, Ref} from "react";
import {createPortal, findDOMNode} from "react-dom";

import {CSSProp, ScrollableContext, springTransition, themr} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import {headerCss} from "../header";

import {ButtonBackToTop} from "./button-back-to-top";
export {ButtonBttCss, buttonBttCss} from "./button-back-to-top";
import {Header} from "./header";

import scrollableCss, {ScrollableCss} from "./__style__/scrollable.css";
export {scrollableCss, ScrollableCss};
const Theme = themr("scrollable", scrollableCss);

export interface ScrollableProps {
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 300. */
    backToTopOffset?: number;
    /** Children. */
    children?: ReactNode;
    /** Classe CSS. */
    className?: string;
    /** @internal */
    /** Ref vers le div container. */
    innerRef?: Ref<HTMLDivElement>;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** Reset le scroll (à 0) dès que les children du scrollable changent.  */
    resetScrollOnChildrenChange?: boolean;
    /** CSS. */
    theme?: CSSProp<ScrollableCss>;
}

// eslint-disable-next-line react/no-unsafe
@observer
class ScrollableComponent extends Component<ScrollableProps> {
    @observable.ref header?: HTMLElement;
    @observable.ref headerProps?: HTMLMotionProps<"header">;

    @observable.ref containerNode!: HTMLDivElement;
    @observable.ref menuNode!: HTMLDivElement;
    @observable.ref scrollableNode!: HTMLDivElement;

    @observable.ref intersectionObserver!: IntersectionObserver;
    @observable.ref mutationObserver!: MutationObserver;
    @observable.ref resizeObserver!: ResizeObserver;

    readonly menuRefs = observable.map<Key, HTMLElement>({}, {deep: false});
    readonly menuParentNodes = new Map<Key, HTMLElement>();
    readonly onIntersects = new Map<Element, (ratio: number, isIntersecting: boolean) => void>();

    @observable canDeploy = false;
    @observable hasBtt = false;
    @observable headerHeight = 0;
    @observable isHeaderSticky = false;
    @observable isInitialized = false;
    @observable isMenuOpened = true;
    @observable isMenuRetractable = true;
    @observable visibleHeader = 1;
    @observable width = 0;

    setRef = memoize((key: Key) =>
        action((ref: HTMLElement | null) => {
            if (!ref && this.menuRefs.has(key)) {
                this.menuRefs.delete(key);
                this.menuParentNodes.delete(key);
                if (!this.menuRefs.size) {
                    this.isMenuOpened = true;
                }
            } else if (ref && !this.menuRefs.has(key)) {
                this.isMenuOpened = true;
                this.menuRefs.set(key, ref);
                this.setMenuRefs();
                this.updateMenuParentNodes("0%");
            }
        })
    );

    heightInit?: IReactionDisposer;

    constructor(props: ScrollableProps) {
        super(props);
        makeObservable(this);

        this.heightInit = when(
            () => this.isInitialized,
            () => {
                const topRow = document.querySelector(`.${headerCss.topRow}`);
                if (topRow) {
                    const {height} = getComputedStyle(topRow);
                    const headerHeight = +height.substring(0, height.length - 2);
                    if (!Number.isNaN(headerHeight)) {
                        this.headerHeight = headerHeight;
                    }
                }
            }
        );
    }

    componentDidMount() {
        // eslint-disable-next-line react/no-find-dom-node
        this.containerNode = findDOMNode(this) as HTMLDivElement;
        this.scrollableNode.addEventListener("scroll", this.onScroll);
        this.resizeObserver = new ResizeObserver(() => this.onScroll());
        this.resizeObserver.observe(this.scrollableNode);
        this.mutationObserver = new MutationObserver(() => this.onScroll());
        this.mutationObserver.observe(this.scrollableNode, {attributes: true, childList: true, subtree: true});
        this.intersectionObserver = new IntersectionObserver(
            entries =>
                entries.forEach(e => {
                    if (e.target === this.header) {
                        this.isHeaderSticky = !e.isIntersecting;
                    }
                    const onIntersect = this.onIntersects.get(e.target);
                    if (onIntersect) {
                        onIntersect(Math.round(e.intersectionRatio * 100) / 100, e.isIntersecting);
                    }
                }),
            {root: this.scrollableNode, threshold: range(0, 102.5, 2.5).map(t => t / 100)}
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
    UNSAFE_componentWillReceiveProps(props: ScrollableProps) {
        if (props.resetScrollOnChildrenChange && props.children !== this.props.children) {
            this.scrollTo({top: 0, behavior: "auto"});
        }
    }

    componentWillUnmount() {
        this.scrollableNode?.removeEventListener("scroll", this.onScroll);
        this.intersectionObserver?.disconnect();
        this.mutationObserver?.disconnect();
        this.resizeObserver?.disconnect();
        this.heightInit?.();
    }

    @computed.struct
    get headerStatus() {
        return {sticky: this.isHeaderSticky, height: this.headerHeight};
    }

    /** @see ScrollableContext.registerHeader */
    @action.bound
    registerHeader(nonStickyElement: HTMLElement, canDeploy: boolean) {
        if (canDeploy) {
            this.intersectionObserver.observe(nonStickyElement);
        }

        this.canDeploy = canDeploy;
        this.header = nonStickyElement;
        this.isHeaderSticky = !canDeploy;

        return action(() => {
            if (canDeploy) {
                this.intersectionObserver.unobserve(nonStickyElement);
            }

            this.canDeploy = false;
            this.header = undefined;
            this.headerProps = undefined;
            this.isHeaderSticky = false;
        });
    }

    /** @see ScrollableContext.registerHeaderProps */
    @action.bound
    registerHeaderProps(headerProps: HTMLProps<HTMLElement>) {
        this.headerProps = headerProps as HTMLMotionProps<"header">;
        this.onScroll();
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

    /** @see ScrollableContext.menu */
    @action.bound
    menu(node: JSX.Element, parentNode: HTMLElement | null, retractable = true) {
        if (!parentNode) {
            return null;
        }
        if (!node.key) {
            throw new Error("Un élément du menu d'un Scrollable doit avoir une key.");
        }
        this.menuParentNodes.set(node.key, parentNode);
        setTimeout(() => (this.isMenuRetractable = retractable));

        return createPortal(cloneElement(node, {ref: this.setRef(node.key)}), this.menuNode);
    }

    /** @see ScrollableContext.portal */
    @action.bound
    portal(node: JSX.Element) {
        return createPortal(node, this.containerNode);
    }

    @action.bound
    updateMenuParentNodes(x: string) {
        const per = (+x.replace("%", "") + 100) / 100;
        this.menuParentNodes.forEach(node => (node.style.marginLeft = `${this.menuNode.clientWidth * per}px`));
    }

    @action.bound
    onScroll() {
        this.width = this.scrollableNode.clientWidth;
        this.hasBtt = this.scrollableNode.scrollTop + this.headerHeight > (this.props.backToTopOffset ?? 300);
        this.setMenuRefs();
    }

    setMenuRefs() {
        this.menuRefs.forEach((menuRef, key) => {
            const parentNode = this.menuParentNodes.get(key)!;
            const headerHeight = (this.canDeploy ? this.visibleHeader : 1) * this.headerHeight;
            const marginTop = Math.max(
                headerHeight,
                getOffsetTop(parentNode, this.scrollableNode) - this.scrollableNode.scrollTop
            );
            menuRef.style.marginTop = `${marginTop}px`;
            menuRef.style.height = `calc(100% - ${marginTop}px)`;

            const buttonMenu = this.menuNode.children.item(this.menuNode.children.length - 1);
            if (buttonMenu?.nodeName === "BUTTON") {
                (buttonMenu as HTMLElement).style.top = `${marginTop}px`;
            }
        });
    }

    setHeight = (height: number) => {
        this.headerHeight = height;
    };

    setInitialized = (_: any) => {
        this.isInitialized = true;
    };

    setMenuNode = (ref: HTMLDivElement | null) => ref && (this.menuNode = ref);
    setScrollableNode = (ref: HTMLDivElement | null) => ref && (this.scrollableNode = ref);

    Header = () =>
        useObserver(() => (
            <AnimatePresence>
                {this.headerProps && this.isHeaderSticky ? (
                    <Header
                        {...this.headerProps}
                        animated={this.canDeploy}
                        onHeightChange={this.setHeight}
                        onUpdate={({y}) => {
                            this.visibleHeader = Math.max(0, (+(y as string).replace("%", "") + 100) / 100);
                            this.setMenuRefs();
                        }}
                        style={{width: this.width}}
                    />
                ) : undefined}
            </AnimatePresence>
        ));

    BackToTop = () =>
        useObserver(() => (
            <AnimatePresence>
                {!this.props.hideBackToTop && this.hasBtt ? <ButtonBackToTop /> : undefined}
            </AnimatePresence>
        ));

    getHeaderStatus = () => this.headerStatus;

    render() {
        const {children, className, innerRef} = this.props;
        return (
            <ScrollableContext.Provider
                // eslint-disable-next-line react/jsx-no-constructed-context-values
                value={{
                    getHeaderStatus: this.getHeaderStatus,
                    menu: this.menu,
                    portal: this.portal,
                    registerHeader: this.registerHeader,
                    registerHeaderProps: this.registerHeaderProps,
                    registerIntersect: this.registerIntersect,
                    scrollTo: this.scrollTo
                }}
            >
                <Theme theme={this.props.theme}>
                    {theme => (
                        <div ref={innerRef} className={classNames(theme.container(), className)}>
                            <div ref={this.setScrollableNode} className={theme.scrollable()}>
                                {this.intersectionObserver ? (
                                    <>
                                        {children}
                                        <div ref={this.setInitialized} />
                                    </>
                                ) : null}
                            </div>
                            <motion.div
                                ref={this.setMenuNode}
                                animate={this.isMenuOpened ? "opened" : "closed"}
                                className={theme.menu()}
                                initial={false}
                                onUpdate={({x}) => {
                                    this.updateMenuParentNodes(x as string);
                                }}
                                transition={this.menuRefs.size ? springTransition : {duration: 0}}
                                variants={{
                                    opened: {x: "0%"},
                                    closed: {x: "-100%"}
                                }}
                            >
                                {this.menuRefs.size && this.isMenuRetractable ? (
                                    <Button
                                        className={theme.menuButton()}
                                        icon={`keyboard_arrow_${this.isMenuOpened ? "left" : "right"}`}
                                        onClick={() => (this.isMenuOpened = !this.isMenuOpened)}
                                    />
                                ) : null}
                            </motion.div>
                            <this.Header />
                            <this.BackToTop />
                        </div>
                    )}
                </Theme>
            </ScrollableContext.Provider>
        );
    }
}

export const Scrollable = forwardRef<HTMLDivElement, PropsWithChildren<ScrollableProps>>((props, ref) => (
    <ScrollableComponent {...props} innerRef={ref} />
));

function getOffsetTop(node: HTMLElement, container: HTMLElement) {
    let distance = node.offsetTop;
    if (node.offsetParent && node.offsetParent !== container) {
        distance += getOffsetTop(node.offsetParent as HTMLElement, container);
    }
    return distance;
}
