import "intersection-observer";

import {action, observable} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import React from "react";
import {createPortal} from "react-dom";
import {Transition} from "react-pose";

import {ButtonBackToTop} from "./button-back-to-top";

import {container, scrollable, sticky} from "./__style__/scrollable.css";

export const ScrollableContext = React.createContext<{
    /** Enregistre le header. */
    registerHeader(node: JSX.Element, element: Element, canDeploy?: boolean): () => void;
    /** Enregistre un évènement de scroll dans le contexte et retourne son disposer. */
    registerScroll(onScroll: (top: number, height: number) => void): () => void;
    /** Scrolle vers la position demandée. */
    scrollTo(options?: ScrollToOptions): void;
    /** Affiche un élement en sticky */
    sticky(node: JSX.Element): React.ReactPortal;
}>({} as any);

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
}> {
    header?: [JSX.Element, Element];
    stickyHeader?: HTMLElement | null;
    observer!: IntersectionObserver;
    node!: HTMLDivElement | null;
    stickyNode!: HTMLDivElement | null;

    readonly onScrolls = observable<(top: number, height: number) => void>([], {deep: false});
    stickies = observable.map<Element, boolean>();

    @observable hasBtt = false;
    @observable width = 0;
    @observable headerHeight = 0;

    @action.bound
    registerHeader(node: JSX.Element, element: Element, canDeploy = true) {
        if (canDeploy) {
            this.observer.observe(element);
        }
        this.stickies.set(element, !canDeploy);
        this.header = [node, element];
        return () => {
            if (canDeploy) {
                this.observer.unobserve(element);
            }
            this.stickies.delete(element);
            this.header = undefined;
        };
    }

    @action.bound
    registerScroll(onScroll: (top: number, height: number) => void) {
        this.onScrolls.push(onScroll);

        if (this.node) {
            onScroll(this.node.scrollTop + this.headerHeight, this.node.clientHeight);
        }

        return () => this.onScrolls.remove(onScroll);
    }

    @action.bound
    scrollTo(options?: ScrollToOptions) {
        const {scrollBehaviour = "smooth"} = this.props;
        this.node!.scrollTo({behavior: scrollBehaviour, ...options});
    }

    @action.bound
    sticky(node: JSX.Element) {
        return createPortal(node, this.stickyNode!);
    }

    /** Permet de n'afficher le bouton que si le scroll a dépassé l'offset. */
    @disposeOnUnmount
    bttScroll = this.registerScroll(top => (this.hasBtt = top > (this.props.backToTopOffset || 200)));

    componentDidMount() {
        this.node!.addEventListener("scroll", this.onScroll);
        window.addEventListener("resize", this.onScroll);
        this.onScroll();

        this.observer = new IntersectionObserver(
            entries => entries.forEach(e => this.stickies.set(e.target, !e.isIntersecting)),
            {root: this.node}
        );
    }

    componentDidUpdate() {
        this.width = this.node!.clientWidth;
    }

    componentWillUnmount() {
        this.node!.removeEventListener("scroll", this.onScroll);
        window.removeEventListener("resize", this.onScroll);
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
                    registerScroll: this.registerScroll,
                    scrollTo: this.scrollTo,
                    sticky: this.sticky
                }}
            >
                <div className={`${className || ""} ${container}`}>
                    <Transition>
                        {(this.header && this.stickies.get(this.header[1])) || false
                            ? React.cloneElement(this.header[0], {
                                  ref: (stickyHeader: any) => (this.stickyHeader = stickyHeader),
                                  key: "header",
                                  style: {width: this.width}
                              })
                            : undefined}
                        <div
                            key="sticky"
                            className={sticky}
                            ref={div => (this.stickyNode = div)}
                            style={{width: this.width, top: this.headerHeight}}
                        />
                        <div key="scrollable" className={scrollable} ref={div => (this.node = div)}>
                            {children}
                        </div>
                        {!hideBackToTop && this.hasBtt ? <ButtonBackToTop key="backtotop" /> : undefined}
                    </Transition>
                </div>
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
