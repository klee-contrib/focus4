import {zip} from "es-toolkit";
import {action, observable, observe, when} from "mobx";
import {useLocalObservable} from "mobx-react";
import {useCallback, useContext, useEffect, useRef} from "react";

import {ScrollableContext} from "@focus4/layout";
import {CollectionStore} from "@focus4/stores";

/** Arguments pour le hook `usePagination`. */
export interface UsePaginationArgs<T extends object> {
    /** Les données du tableau. */
    data?: T[];
    /** Précise si la liste est en cours de chargement (surchargé par le store si disponible). */
    isLoading?: boolean;
    /**
     * Mode de pagination :
     * - `"single-auto"` (par défaut) : Le contenu de la page suivante s'affichera automatiquement à la suite de la page courante, une fois que l'élement sentinelle (déterminé par `sentinelItemIndex`) sera visible à l'écran.
     * - `"single-manual"` : Le contenu de la page suivante s'affichera à la suite de la page courante, via un bouton "Voir plus" dédié.
     * - `"multiple"` : Le contenu de la page suivante remplacera le contenu de la page courante. La navigation entre les pages se fera via des boutons de navigation dédiés.
     */
    paginationMode?: "multiple" | "single-auto" | "single-manual";
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage?: number;
    /**
     * Index de l'item en partant du bas de page courante qui chargera, dès qu'il sera visible à l'écran, la page suivante (en pagination `"single-auto"`).
     *
     * Par défaut : 5.
     */
    sentinelItemIndex?: number;
    /** Le store contenant la liste. */
    store?: CollectionStore<T>;
}

/** Etat d'affichage pour un composant liste. */
export interface ListState<T extends object> {
    /** Index du premier élément affiché. */
    displayedStart: number;
    /** Index du dernier élément affiché. */
    displayedEnd?: number;
    /** Données complètes de la liste. */
    readonly data: T[];
    /** Données affichées de la liste. */
    readonly displayedData: T[];
    /** Si la liste est en cours de chargement. */
    readonly isLoading: boolean;
    /** S'il y a encore des données à charger. */
    readonly hasMoreToLoad: boolean;
    /** S'il y a des données de la liste avant celles affichées. */
    readonly hasMoreBefore: boolean;
    /** S'il y a des données de la liste après celles affichées. */
    readonly hasMoreAfter: boolean;
}

/** L'état de pagination, retourné par `usePagination`. */
export interface PaginationState<T extends object> {
    /** Getter pour la ref éventuelle à poser pour l'élément sentinelle. */
    getDomRef: (idx: number) => ((listNode: HTMLElement | null) => void) | undefined;
    /** Handler pour le bouton de première page. */
    handleFirst: () => void;
    /** Handler pour le bouton de dernière page.. */
    handleLast: () => void;
    /** Handler pour le bouton de page suivante. */
    handleNext: () => void;
    /** Handler pour le bouton de page précédente. */
    handlePrevious: () => void;
    /** L'état de liste. */
    state: ListState<T>;
}

/** Hook pour gérer la pagination. */
export function usePagination<T extends object>({
    data,
    isLoading,
    paginationMode,
    perPage,
    sentinelItemIndex = 5,
    store
}: UsePaginationArgs<T>): PaginationState<T> {
    const state = useLocalObservable(
        () => ({
            /** Index du premier élément affiché. */
            displayedStart: 0,
            /** Index du dernier élément affiché (si renseigné, sinon tout est affiché). */
            displayedEnd: perPage,

            /** Copie des props pour les champs calculés. */
            _data: data,
            _isLoading: isLoading,
            _perPage: perPage,
            _store: store,

            /** Données de la liste. */
            get data() {
                return (this._store ? this._store.list : this._data)!;
            },

            /** Données mises à plat, pour calculer le reset de la pagination. */
            get spreadData() {
                return [...this.data];
            },

            /** Etat de chargement de la liste. */
            get isLoading() {
                return this._store?.isLoading ?? this._isLoading ?? false;
            },

            /** Les données affichées. */
            get displayedData() {
                if (this.displayedEnd !== undefined) {
                    return this.data.slice(this.displayedStart, this.displayedEnd);
                } else {
                    return this.data;
                }
            },

            /** S'il y a des éléments masqués avant les éléments affichés. */
            get hasMoreBefore() {
                return this.displayedStart > 0;
            },

            /** S'il y a des éléments masqués après les éléments affichés. */
            get hasMoreAfter() {
                return this.displayedEnd !== undefined && this.displayedEnd < this.data.length;
            },

            /** S'il y a encore des données à charger. */
            get hasMoreToLoad() {
                return (
                    this._store?.type === "server" &&
                    (this.displayedEnd === undefined ||
                        this._perPage === undefined ||
                        this._store.currentCount - this.displayedEnd < this._perPage) &&
                    this._store.totalCount > this._store.currentCount
                );
            }
        }),
        {_data: observable.ref, _store: observable.ref}
    );

    /** Recopie des props dans l'état observable. */
    useEffect(
        action(() => {
            state._data = data;
            state._isLoading = isLoading;
            state._perPage = perPage;
            state._store = store;
        }),
        [data, isLoading, perPage, store]
    );

    /** (Ré)initialise la pagination dès que les données changent. */
    useEffect(() => {
        observe(state, "spreadData", ({oldValue = [], newValue = []}) => {
            if (newValue.length < oldValue.length || !zip(oldValue, newValue).every(([o, n]) => !o || !n || o === n)) {
                state.displayedStart = 0;
                state.displayedEnd = perPage;
            }
        });
    }, [perPage]);

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
    const {registerIntersect} = useContext(ScrollableContext);
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
        handlePrevious,
        state
    };
}
