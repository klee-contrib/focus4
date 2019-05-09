import * as React from "react";

import {PanelDescriptor} from "./panel";

/** Contexte d'un Scrollable, expose les méthodes associées. */
export const ScrollableContext = React.createContext<{
    /**
     * Enregistre le header dans le Scrollable
     * @param Header Le composant de header.
     * @param headerProps Les props du composant de header.
     * @param nonStickyElement Le noeud DOM représentant le header non sticky.
     * @param canDeploy Précise si le header est toujours sticky ou non.
     * @returns Le disposer.
     */
    registerHeader(
        Header: React.ElementType,
        headerProps: React.HTMLProps<HTMLElement>,
        nonStickyElement: HTMLElement,
        canDeploy?: boolean
    ): () => void;
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
    /**
     * Affiche un élement dans le Scrollable.
     * @param node Le noeud React.
     * @param parentNode SI renseigné, le noeud sera placé en zone sticky et suivra la position de ce noeud.
     * @returns Le Portal associé.
     */
    portal(node: JSX.Element, parentNode?: HTMLElement | null): React.ReactPortal;
}>({} as any);

/** Contexte d'un ScrollspyContainer, expose les méthodes associées. */
export const ScrollspyContext = React.createContext({
    /**
     * Enregistre un panel dans le container et retourne son id.
     * @param panel La description d'un panel
     * @param sscId L'id du panel souhaité.
     * @returns L'id du panel.
     */
    registerPanel: (() => "") as (panel: PanelDescriptor, sscId?: string) => string,
    /**
     * Retire un panel du container.
     * @param id L'id du panel.
     */
    removePanel: (() => null) as (id: string) => void,
    /**
     * Met à jour un panel.
     * @param id L'id du panel.
     * @param desc La description du panel.
     */
    updatePanel: (() => null) as (id: string, desc: PanelDescriptor) => void
});
