import {createContext, HTMLProps, ReactElement, ReactPortal} from "react";

export interface PanelDescriptor {
    node: HTMLDivElement;
    title?: string;
}

/** Contexte d'un Scrollable, expose les méthodes associées. */
export const ScrollableContext = createContext<{
    /**
     * Retourne la status du header.
     * @returns La taille du header et s'il est sticky ou non.
     */
    getHeaderStatus(): {sticky: boolean; height: number};
    /**
     * Affiche un élement dans le menu sticky du Scrollable
     * @param node Le noeud React.
     * @param parentNode Noeud à suivre pour positionner l'élément sticky.
     * @param retractable Menu rétractable.
     * @returns Le Portal associé.
     */
    menu(node: ReactElement, parentNode: HTMLElement | null, retractable: boolean): ReactPortal | null;
    /**
     * Affiche un élement dans le Scrollable.
     * @param node Le noeud React.
     * @returns Le Portal associé.
     */
    portal(node: ReactElement): ReactPortal;
    /**
     * Enregistre le header dans le Scrollable
     * @param nonStickyElement Le noeud DOM représentant le header non sticky.
     * @param canDeploy Précise si le header est toujours sticky ou non.
     * @returns Le disposer.
     */
    registerHeader(nonStickyElement: HTMLElement, canDeploy: boolean): () => void;
    /**
     * Set les props du header du Scrollable.
     * @param headerProps Les props du header.
     * @returns Le disposer.
     */
    registerHeaderProps(headerProps: HTMLProps<HTMLElement>): void;
    /**
     * Enregistre un observateur d'intersection avec le viewport du Scrollable.
     * @param node Le noeud DOM à observer.
     * @param onIntersect Le callback à appeler lors d'une intersection.
     * @returns Le disposer.
     */
    registerIntersect(node: HTMLElement, onIntersect: (ratio: number, isIntersecting: boolean) => void): () => void;
    /**
     * Scrolle vers la position demandée.
     * @param options Options.
     */
    scrollTo(options?: ScrollToOptions): void;
}>({} as any);

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
