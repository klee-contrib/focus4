import {action, when} from "mobx";
import {useCallback, useContext, useRef} from "react";

import {ScrollableContext} from "@focus4/layout";
import {CollectionStore} from "@focus4/stores";

import {ListState} from "./list-state";

/** Arguments pour le hook `usePagination`. */
export interface UsePaginationArgs<T extends object> {
    /**
     * Mode de pagination :
     * - `"single-auto"` (par défaut) : Le contenu de la page suivante s'affichera automatiquement à la suite de la page courante, une fois que l'élement sentinelle (déterminé par `sentinelItemIndex`) sera visible à l'écran.
     * - `"single-manual"` : Le contenu de la page suivante s'affichera à la suite de la page courante, via un bouton "Voir plus" dédié.
     * - `"multiple"` : Le contenu de la page suivante remplacera le contenu de la page courante. La navigation entre les pages se fera via des boutons de navigation dédiés.
     */
    paginationMode?: "multiple" | "single-auto" | "single-manual";
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage?: number;
    /** Etat de liste, retourné par `useListState`. */
    state: ListState<T>;
    /**
     * Index de l'item en partant du bas de page courante qui chargera, dès qu'il sera visible à l'écran, la page suivante (en pagination `"single-auto"`).
     *
     * Par défaut : 5.
     */
    sentinelItemIndex?: number;
    /** Le store contenant la liste. */
    store?: CollectionStore<T>;
}

/** Hook pour gérer la pagination (les fonctions pour naviguer et le scroll infini). */
export function usePagination<T extends object>({
    paginationMode,
    perPage,
    sentinelItemIndex = 5,
    state,
    store
}: UsePaginationArgs<T>) {
    const {registerIntersect} = useContext(ScrollableContext);

    /** Charge la première page. */
    const handleFirst = useCallback(
        action(function handleFirst() {
            if (perPage) {
                state.displayedStart = 0;
                state.displayedEnd = perPage;
            }
        }),
        [perPage]
    );

    /** Charge la page précédente. */
    const handlePrevious = useCallback(
        action(function handlePrevious() {
            if (perPage && state.displayedEnd !== undefined) {
                state.displayedStart = Math.max(0, state.displayedStart - perPage);
                state.displayedEnd = Math.max(0, state.displayedEnd - perPage);
            }
        }),
        [perPage]
    );

    /** Charge la page suivante. */
    const handleNext = useCallback(
        action(async function handleNext() {
            if (store?.type === "server") {
                await when(() => !store.isLoading);
                if (state.hasMoreToLoad) {
                    await store.search(true);
                }
            }
            if (perPage && state.displayedEnd && state.hasMoreAfter) {
                state.displayedEnd += perPage;
                if (paginationMode === "multiple") {
                    state.displayedStart += perPage;
                }
            }
        }),
        [paginationMode, perPage, store]
    );

    /** Charge la dernière page. */
    const handleLast = useCallback(
        action(function handleLast() {
            if (perPage && state.displayedEnd && paginationMode === "multiple" && store?.type !== "server") {
                state.displayedStart = state.data.length - perPage;
                state.displayedEnd = state.data.length;
            }
        }),
        [paginationMode, perPage, store]
    );

    /** Enregistre un élément de la liste comme marqueur pour le scroll infini. */
    const sentinel = useRef<() => void>(null);
    const registerSentinel = useCallback(
        function registerSentinel(listNode: HTMLElement | null) {
            if (paginationMode === "single-auto" && (store?.type === "server" || !!perPage) && listNode) {
                sentinel.current?.();
                sentinel.current = registerIntersect(listNode, (_, isIntersecting) => {
                    if (isIntersecting) {
                        handleNext();
                        sentinel.current?.();
                    }
                });
            }
        },
        [handleNext]
    );

    /** Getter pour la ref de DOM à poser sur l'élément sentinelle. */
    const getDomRef = useCallback(
        function getDomRef(idx: number) {
            if (
                state.displayedData.length - idx === sentinelItemIndex ||
                (state.displayedData.length < sentinelItemIndex && state.displayedData.length - 1 === idx)
            ) {
                return registerSentinel;
            }
        },
        [sentinelItemIndex, state]
    );

    return {
        getDomRef,
        handleFirst,
        handleLast,
        handleNext,
        handlePrevious
    };
}
