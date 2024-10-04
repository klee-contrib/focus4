import {createContext, ReactElement, ReactPortal} from "react";

export interface PanelDescriptor {
    node: HTMLDivElement;
    title?: string;
}

/** Context d'un header, pour gérer son caractère sticky avec la présence ou non d'un `HeaderContent` */
export const HeaderContext = createContext({
    /** Si le header est sticky (s'il n'y pas de `HeaderContent`, ou s'il est sorti du viewport). */
    sticky: true,
    /** Met à jour le caractère sticky du header. */
    setSticky(sticky: boolean) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        sticky;
    }
});

/** Contexte d'un Scrollable, expose les méthodes associées. */
export const ScrollableContext = createContext<{
    /** Hauteur calculée du `HeaderTopRow` (s'il y en a un) */
    headerHeight: number;
    /**
     * Affiche un élement dans le Scrollable.
     * @param node Le noeud React.
     * @returns Le Portal associé.
     */
    portal(node: ReactElement): ReactPortal | null;
    /**
     * Enregistre un observateur d'intersection avec le viewport du Scrollable.
     * @param node Le noeud DOM à observer.
     * @param onIntersect Le callback à appeler lors d'une intersection.
     * @returns Le disposer.
     */
    registerIntersect(node: HTMLElement, onIntersect: (ratio: number, isIntersecting: boolean) => void): () => void;
    /** Met à jour la hauteur du `HeaderTopRow` */
    setHeaderHeight: (height: number) => void;
    /**
     * Scrolle vers la position demandée.
     * @param options Options.
     */
    scrollTo(options?: ScrollToOptions): void;
}>({
    headerHeight: 0,
    portal: () => null,
    registerIntersect: () => () => {
        /** */
    },
    setHeaderHeight() {
        /** */
    },
    scrollTo() {
        /** */
    }
});

/** Contexte d'un ScrollspyContainer, expose les méthodes associées. */
export const ScrollspyContext = createContext({
    /**
     * Enregistre un panel dans le Scrollspu
     * @param name L'id du panel souhaité.
     * @param panel La description d'un panel
     */
    registerPanel(name: string, panel: PanelDescriptor): (() => void) | undefined {
        return () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            name;
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            panel;
        };
    }
});
