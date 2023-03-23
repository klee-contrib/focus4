import i18next from "i18next";
import {isEqual} from "lodash";
import {extendObservable, observable, observe} from "mobx";
import {useLocalObservable} from "mobx-react";
import {useContext, useEffect, useState} from "react";

import {CollectionStore} from "@focus4/stores";
import {CSSProp, getIcon, ScrollableContext, useTheme} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import listBaseCss, {ListBaseCss} from "./__style__/list-base.css";
export {listBaseCss, ListBaseCss};

/** Props de base pour un composant de liste. */
export interface ListBaseProps<T> {
    /** CSS */
    baseTheme?: CSSProp<ListBaseCss>;
    /** Préfixe i18n pour les libellés de la liste. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Affiche le bouton "Voir plus" au lieu d'un scroll infini. */
    isManualFetch?: boolean;
    /** Fonction pour déterminer la key à utiliser pour chaque élément de la liste. */
    itemKey: (item: T, idx: number) => number | string | undefined;
    /** Précise si la liste est en cours de chargement (surchargé par le store si disponible). */
    isLoading?: boolean;
    /** (Scroll infini) Index de l'item, en partant du bas de la liste affichée, qui charge la page suivante dès qu'il est visible. Par défaut : 5. */
    pageItemIndex?: number;
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage?: number;
    /** Affiche un bouton "Voir tout" qui effectue cette action. */
    showAllHandler?: () => void;
}

export function useListBase<T>({
    baseTheme,
    data,
    i18nPrefix = "focus",
    itemKey,
    isLoading,
    isManualFetch,
    pageItemIndex = 5,
    perPage,
    showAllHandler,
    store
}: ListBaseProps<T> & {data?: T[]; store?: CollectionStore<T>}) {
    const context = useContext(ScrollableContext);
    const theme = useTheme("listBase", listBaseCss, baseTheme);
    const state = useLocalObservable(
        () => ({
            /** Nombre d'éléments affichés. */
            displayedCount: perPage,

            _data: data,
            get data() {
                return (store ? store.list : state._data)!;
            },

            /** Les données affichées. */
            get displayedData() {
                if (state.displayedCount) {
                    return state.data.slice(0, state.displayedCount);
                } else {
                    return state.data;
                }
            },

            /** Correspond aux données chargées mais non affichées. */
            get hasMoreHidden() {
                return (this.displayedCount && this.data.length > this.displayedCount) || false;
            },

            /** Correpond aux données non chargées. */
            get hasMoreToLoad() {
                return store && store.totalCount > store.currentCount;
            },

            /** On complète le `hasMoreData` avec l'info du nombre de données chargées, si c'est un SearchStore. */
            get hasMoreData() {
                return this.hasMoreHidden || this.hasMoreToLoad;
            },

            _isLoading: isLoading,
            get isLoading() {
                return store?.isLoading ?? state._isLoading ?? false;
            },

            /** Label du bouton "Voir plus". */
            get showMoreLabel() {
                if (store?.type === "server") {
                    return i18next.t(`${i18nPrefix}.list.show.more`);
                } else {
                    return `${i18next.t(`${i18nPrefix}.list.show.more`)} (${this.displayedData.length} / ${
                        this.data.length
                    } ${i18next.t(`${i18nPrefix}.list.show.displayed`)})`;
                }
            },

            /** Scroll infini disponible. */
            get hasInfiniteScroll() {
                return !isManualFetch && (store?.type === "server" || !!perPage);
            },

            /** Charge la page suivante. */
            handleShowMore() {
                if (state.hasMoreHidden) {
                    if (state.hasMoreData) {
                        state.displayedCount! += perPage ?? 5;
                    }
                } else if (store?.type === "server" && state.hasMoreToLoad && !store.isLoading) {
                    store.search(true);
                    if (perPage) {
                        if (state.hasMoreData) {
                            state.displayedCount! += perPage ?? 5;
                        }
                    }
                }
            },

            /** Enregistre un élément de la liste comme marqueur pour le scroll infini. */
            registerSentinel(listNode: HTMLElement | null) {
                if (state.hasInfiniteScroll) {
                    if (listNode) {
                        const sentinel = context.registerIntersect(listNode, (_, isIntersecting) => {
                            if (isIntersecting) {
                                state.handleShowMore();
                                sentinel();
                            }
                        });
                    }
                }
            }
        }),
        {_data: observable.ref}
    );

    useEffect(() => {
        state._data = data;
        state._isLoading = isLoading;
    }, [data, isLoading]);

    /** (Ré)initialise la pagination dès que les données affichées changent. */
    useEffect(
        () =>
            observe(state, "displayedData", ({oldValue, newValue}) => {
                if (
                    oldValue!.length > newValue.length ||
                    !isEqual(oldValue!.map(itemKey), newValue.map(itemKey).slice(0, oldValue!.length))
                ) {
                    state.displayedCount = perPage;
                }
            }),
        []
    );

    const [res] = useState(() =>
        extendObservable(
            {
                i18nPrefix,
                itemKey,
                store,
                getDomRef(idx: number) {
                    return state.displayedData.length - idx === pageItemIndex ||
                        (state.displayedData.length < pageItemIndex && state.displayedData.length - 1 === idx)
                        ? state.registerSentinel
                        : undefined;
                }
            },
            {
                /** Affiche les éventuels boutons "Voir plus" et "Voir tout" en fin de liste. */
                get bottomRow() {
                    if ((isManualFetch && state.hasMoreData) || showAllHandler) {
                        return (
                            <div className={theme.bottomRow()}>
                                {isManualFetch && state.hasMoreData ? (
                                    <Button
                                        icon={getIcon(`${i18nPrefix}.icons.list.add`)}
                                        label={state.showMoreLabel}
                                        onClick={() => state.handleShowMore()}
                                    />
                                ) : (
                                    <div />
                                )}
                                {showAllHandler ? (
                                    <Button
                                        icon={getIcon(`${i18nPrefix}.icons.list.showAll`)}
                                        label={i18next.t(`${i18nPrefix}.list.show.all`)}
                                        onClick={showAllHandler}
                                    />
                                ) : null}
                            </div>
                        );
                    } else {
                        return null;
                    }
                },

                get displayedData() {
                    return state.displayedData;
                },

                get isLoading() {
                    return state.isLoading;
                }
            }
        )
    );

    return res;
}
