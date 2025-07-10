import {createContext, ReactElement, ReactPortal} from "react";

import {Icon} from "@focus4/toolbox";

export interface PanelDescriptor {
    node: HTMLDivElement;
    title?: string;
    icon?: Icon;
}

/** Contexte d'un header, pour gérer son caractère sticky avec la présence ou non d'un `HeaderContent` */
export const HeaderContext = createContext({
    /** Si le header est sticky (s'il n'y pas de `HeaderContent`, ou s'il est sorti du viewport). */
    sticky: true,
    /** Met à jour le caractère sticky du header. */
    setSticky(sticky: boolean) {
        // oxlint-disable-next-line no-unused-expressions
        sticky;
    }
});

/**
 * Contexte pour gérer les overlays, posé par le Layout.
 * Utilisé par le `MainMenu` et le `Layout` pour poser l'`Overlay` et par `useOverlay` pour l'activer.
 */
export const OverlayContext = createContext<{
    /** Niveau de scrollable à partir du quel il faut afficher l'overlay. */
    activeLevel: number;
    /** Pour fermer l'overlay. Correspond au `close` passé par le dernier `useOverlay` (via `toggle`) de la pile. */
    close(): void;
    /**
     * Active ou désactive l'overlay pour un composant donné.
     * @param id Id unique pour le composant (via `useId` par exemple).
     * @param level Niveau du scrollable courant dans lequel se trouve le composant (via `useContext(ScrollableContext).level`).
     * @param active Actif/inactif
     * @param close Fonction pour fermer l'overlay au clic.
     */
    toggle(id: string, level: number, active: boolean, close?: () => void): void;
}>({
    activeLevel: -1,
    close() {
        /** */
    },
    toggle() {
        /** */
    }
});

/** Contexte d'un Scrollable, expose les méthodes associées. */
export const ScrollableContext = createContext<{
    /** Hauteur calculée du `HeaderTopRow` (s'il y en a un) */
    headerHeight: number;
    /** Niveau d'empilement de scrollable. Celui du `Layout` sera le niveau 0, augmenté pour chaque `Scrollable` posé à l'intérieur. */
    level: number;
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
    /** @internal */
    /** Met à jour la hauteur du `HeaderTopRow` */
    setHeaderHeight: (height: number) => void;
    /**
     * Scrolle vers la position demandée.
     * @param options Options.
     */
    scrollTo(options?: ScrollToOptions): void;
}>({
    headerHeight: 0,
    level: -1,
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
            // oxlint-disable-next-line no-unused-expressions
            name;
            // oxlint-disable-next-line no-unused-expressions
            panel;
        };
    }
});
