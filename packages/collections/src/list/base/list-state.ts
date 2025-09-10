import {zip} from "es-toolkit";
import {action, observable, observe} from "mobx";
import {useLocalObservable} from "mobx-react";
import {useEffect} from "react";

import {CollectionStore} from "@focus4/stores";

/** Arguments pour le hook `useListState`. */
export interface UseListStateArgs<T extends object> {
    /** Les données du tableau. */
    data?: T[];
    /** Précise si la liste est en cours de chargement (surchargé par le store si disponible). */
    isLoading?: boolean;
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage?: number;
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

/** Hook pour construire l'état de composant de liste, qui comprend les infos de pagination et les éléments affichés. */
export function useListState<T extends object>({data, isLoading, perPage, store}: UseListStateArgs<T>): ListState<T> {
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

    return state;
}
