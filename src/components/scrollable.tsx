import {action, observable} from "mobx";
import {observer} from "mobx-react";
import React from "react";
import {createPortal} from "react-dom";

import {ButtonBackToTop} from "./button-back-to-top";

import {container, scrollable, sticky} from "./__style__/scrollable.css";

export const ScrollableContext = React.createContext<{
    header: {
        marginBottom: number;
        topRowHeight: number;
    };
    layout: {
        contentPaddingTop: number;
    };
    /** Enregistre un évènement de scroll dans le contexte et retourne son disposer. */
    registerScroll(onScroll: (top: number, height: number) => void): () => void;
    /** Scrolle vers la position demandée. */
    scrollTo(options?: ScrollToOptions): void;
    /** Affiche un élement en sticky */
    sticky(node: React.ReactNode): React.ReactPortal;
}>({} as any);

@observer
export class Scrollable extends React.Component<{
    /** Offset avant l'apparition du bouton de retour en haut. Par défaut : 100. */
    backToTopOffset?: number;
    /** Classe CSS. */
    className?: string;
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
}> {
    stickyNode!: HTMLDivElement | null;
    node!: HTMLDivElement | null;
    readonly onScrolls = observable<(top: number, height: number) => void>([]);

    @observable header = {
        marginBottom: 50,
        topRowHeight: 60
    };

    @observable layout = {
        contentPaddingTop: 10
    };

    @observable width = 0;

    @action.bound
    registerScroll(onScroll: (top: number, height: number) => void) {
        this.onScrolls.push(onScroll);

        if (this.node) {
            onScroll(this.node.scrollTop, this.node.clientHeight);
        }

        return () => this.onScrolls.remove(onScroll);
    }

    @action.bound
    scrollTo(options?: ScrollToOptions) {
        const {scrollBehaviour = "smooth"} = this.props;
        this.node!.scrollTo({behavior: scrollBehaviour, ...options});
    }

    @action.bound
    sticky(node: React.ReactNode) {
        return createPortal(node, this.stickyNode!);
    }

    componentDidMount() {
        this.node!.addEventListener("scroll", this.onScroll);
        this.node!.addEventListener("resize", this.onScroll);
        this.onScroll();
    }

    componentDidUpdate() {
        this.width = this.node!.clientWidth;
    }

    componentWillUnmount() {
        this.node!.removeEventListener("scroll", this.onScroll);
        this.node!.removeEventListener("resize", this.onScroll);
    }

    @action.bound
    onScroll() {
        this.onScrolls.forEach(onScroll => onScroll(this.node!.scrollTop, this.node!.clientHeight));
        this.width = this.node!.clientWidth;
    }

    render() {
        const {backToTopOffset, children, className, hideBackToTop} = this.props;
        return (
            <ScrollableContext.Provider
                value={{
                    header: this.header,
                    layout: this.layout,
                    registerScroll: this.registerScroll,
                    scrollTo: this.scrollTo,
                    sticky: this.sticky
                }}
            >
                <div className={`${className || ""} ${container}`}>
                    <div className={sticky} style={{width: this.width}} ref={div => (this.stickyNode = div)} />
                    <div className={scrollable} ref={div => (this.node = div)}>
                        {children}
                    </div>
                    {!hideBackToTop ? <ButtonBackToTop offset={backToTopOffset} /> : null}
                </div>
            </ScrollableContext.Provider>
        );
    }
}
