import {action, observable} from "mobx";
import React from "react";

import {scrollable} from "./__style__/scrollable.css";
import {ButtonBackToTop} from "./button-back-to-top";

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
}>({} as any);

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
    node!: HTMLDivElement | null;
    readonly onScrolls = observable<(top: number, height: number) => void>([]);

    @observable header = {
        marginBottom: 50,
        topRowHeight: 60
    };

    @observable layout = {
        contentPaddingTop: 10
    };

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

    componentDidMount() {
        this.node!.addEventListener("scroll", this.onScroll);
        this.node!.addEventListener("resize", this.onScroll);
        this.onScroll();
    }

    componentWillUnmount() {
        this.node!.removeEventListener("scroll", this.onScroll);
        this.node!.removeEventListener("resize", this.onScroll);
    }

    @action.bound
    onScroll() {
        this.onScrolls.forEach(onScroll => onScroll(this.node!.scrollTop, this.node!.clientHeight));
    }

    render() {
        const {backToTopOffset, children, className, hideBackToTop} = this.props;
        return (
            <ScrollableContext.Provider
                value={{
                    header: this.header,
                    layout: this.layout,
                    registerScroll: this.registerScroll,
                    scrollTo: this.scrollTo
                }}
            >
                <div className={`${className || ""} ${scrollable}`} ref={div => (this.node = div)}>
                    {children}
                </div>
                {!hideBackToTop ? <ButtonBackToTop offset={backToTopOffset} /> : null}
            </ScrollableContext.Provider>
        );
    }
}
