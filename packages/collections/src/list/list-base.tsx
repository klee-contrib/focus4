import i18next from "i18next";
import {isEqual} from "lodash";
import {extendObservable, observe} from "mobx";
import {useAsObservableSource, useLocalStore} from "mobx-react";
import * as React from "react";

import {CSSProp, getIcon, ScrollableContext, useTheme} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import {isSearch, ListStoreBase} from "@focus4/stores";
import listBaseCss, {ListBaseCss} from "./__style__/list-base.css";
export {listBaseCss, ListBaseCss};

/** Props de base pour un composant de liste. */
export interface ListBaseProps<T> {
    /** CSS */
    baseTheme?: CSSProp<ListBaseCss>;
    /** Code du groupe à afficher, pour une recherche groupée. */
    groupCode?: string;
    /** Préfixe i18n pour les libellés de la liste. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Affiche le bouton "Voir plus" au lieu d'un scroll infini. */
    isManualFetch?: boolean;
    /** Fonction pour déterminer la key à utiliser pour chaque élément de la liste. */
    itemKey: (item: T, idx: number) => string | number | undefined;
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
    groupCode,
    i18nPrefix = "focus",
    itemKey,
    isLoading,
    isManualFetch,
    pageItemIndex = 5,
    perPage,
    showAllHandler,
    store
}: ListBaseProps<T> & {data?: T[]; store?: ListStoreBase<T>}) {
    const context = React.useContext(ScrollableContext);
    const theme = useTheme("listBase", listBaseCss, baseTheme);
    const oData = useAsObservableSource({data});
    const state = useLocalStore(() => ({
        /** Nombre d'éléments affichés. */
        displayedCount: perPage,

        get data() {
            return (store
                ? groupCode && isSearch(store)
                    ? store.groups.find(group => group.code === groupCode)!.list
                    : store.list
                : oData.data)!;
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
            return store && isSearch(store) && store.totalCount > store.currentCount;
        },

        /** On complète le `hasMoreData` avec l'info du nombre de données chargées, si c'est un SearchStore. */
        get hasMoreData() {
            return this.hasMoreHidden || this.hasMoreToLoad;
        },

        get isLoading() {
            if (store && isSearch(store)) {
                return store.isLoading;
            } else {
                return isLoading || false;
            }
        },

        /** Label du bouton "Voir plus". */
        get showMoreLabel() {
            if (store && isSearch(store)) {
                return i18next.t(`${i18nPrefix}.list.show.more`);
            } else {
                return `${i18next.t(`${i18nPrefix}.list.show.more`)} (${this.displayedData.length} / ${
                    this.data.length
                } ${i18next.t(`${i18nPrefix}.list.show.displayed`)})`;
            }
        },

        /** Scroll infini disponible. */
        get hasInfiniteScroll() {
            return !isManualFetch && ((store && isSearch(store)) || !!perPage);
        },

        /** Charge la page suivante. */
        handleShowMore() {
            if (state.hasMoreHidden) {
                if (state.hasMoreData) {
                    state.displayedCount! += perPage || 5;
                }
            } else if (store && isSearch(store) && state.hasMoreToLoad && !store.isLoading) {
                store.search(true);
                if (perPage) {
                    if (state.hasMoreData) {
                        state.displayedCount! += perPage || 5;
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
    }));

    /** (Ré)initialise la pagination dès que les données affichées changent. */
    React.useEffect(
        () =>
            observe(state, "displayedData", ({oldValue, newValue}) => {
                if (
                    oldValue!.length > newValue.length ||
                    !isEqual(oldValue!.map(itemKey), newValue!.map(itemKey).slice(0, oldValue!.length))
                ) {
                    state.displayedCount = perPage;
                }
            }),
        []
    );

    const [res] = React.useState(() =>
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
                                        onClick={() => state.handleShowMore()}
                                        icon={getIcon(`${i18nPrefix}.icons.list.add`)}
                                        label={state.showMoreLabel}
                                    />
                                ) : (
                                    <div />
                                )}
                                {showAllHandler ? (
                                    <Button
                                        onClick={showAllHandler}
                                        icon={getIcon(`${i18nPrefix}.icons.list.showAll`)}
                                        label={i18next.t(`${i18nPrefix}.list.show.all`)}
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
