import i18next from "i18next";
import {isEqual} from "lodash";
import {action, computed, Lambda, observable, observe} from "mobx";
import {disposeOnUnmount} from "mobx-react";
import * as React from "react";

import {CSSToStrings, getIcon, ScrollableContext, ToBem} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import {LineStyle} from "./line";

import listStyles, {ListCss} from "./__style__/list.css";
export {listStyles};
export type ListStyle = CSSToStrings<ListCss>;

/** Props de base pour un composant de liste. */
export interface ListBaseProps<T> {
    /** CSS de la ligne. */
    lineTheme?: LineStyle;
    /** Préfixe i18n pour les libellés de la liste. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Affiche le bouton "Voir plus" au lieu d'un scroll infini. */
    isManualFetch?: boolean;
    /** Fonction pour déterminer la key à utiliser pour chaque élément de la liste. */
    itemKey: (item: T, idx: number) => string | number | undefined;
    /** (Scroll infini) Index de l'item, en partant du bas de la liste affichée, qui charge la page suivante dès qu'il est visible. Par défaut : 5. */
    pageItemIndex?: number;
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage?: number;
    /** Affiche un bouton "Voir tout" qui effectue cette action. */
    showAllHandler?: () => void;
    /** CSS */
    theme?: ListStyle;
}

/** Classe de base pour toutes les listes Focus. Gère la pagination et le chargement. */
export abstract class ListBase<T, P extends ListBaseProps<T>> extends React.Component<P> {
    static contextType = ScrollableContext;
    context!: React.ContextType<typeof ScrollableContext>;

    /** Nombre d'éléments affichés. */
    @observable displayedCount = this.props.perPage;

    /** (Ré)initialise la pagination dès que les données affichées changent. */
    @disposeOnUnmount
    protected countResetter: Lambda = observe(
        (this as any) as {displayedData: T[]},
        "displayedData",
        ({oldValue, newValue}) => {
            if (
                oldValue!.length > newValue.length ||
                !isEqual(
                    oldValue!.map(this.props.itemKey),
                    newValue!.map(this.props.itemKey).slice(0, oldValue!.length)
                )
            ) {
                this.displayedCount = this.props.perPage;
            }
        }
    );

    /** Les données. */
    protected abstract get data(): T[];

    /** Les données affichées. */
    @computed
    protected get displayedData() {
        if (this.displayedCount) {
            return this.data.slice(0, this.displayedCount);
        } else {
            return this.data;
        }
    }

    /** Détermine s'il y a encore des données non affichées. */
    @computed
    protected get hasMoreData() {
        if (this.displayedCount) {
            return this.data.length > this.displayedCount;
        } else {
            return false;
        }
    }

    /** Label du bouton "Voir plus". */
    @computed
    protected get showMoreLabel() {
        const {i18nPrefix = "focus"} = this.props;
        return `${i18next.t(`${i18nPrefix}.list.show.more`)} (${this.displayedData.length} / ${
            this.data.length
        } ${i18next.t(`${i18nPrefix}.list.show.displayed`)})`;
    }

    protected get hasInfiniteScroll() {
        const {isManualFetch, perPage} = this.props;
        return !!(!isManualFetch && perPage);
    }

    @action.bound
    protected registerSentinel(listNode: HTMLElement | null) {
        if (this.hasInfiniteScroll) {
            if (listNode) {
                const sentinel = this.context.registerIntersect(listNode, (_, isIntersecting) => {
                    if (isIntersecting) {
                        this.handleShowMore();
                        sentinel();
                    }
                });
            }
        }
    }

    /** Charge la page suivante. */
    @action
    protected handleShowMore() {
        if (this.hasMoreData) {
            this.displayedCount! += this.props.perPage || 5;
        }
    }

    /** Affiche les éventuels boutons "Voir plus" et "Voir tout" en fin de liste. */
    protected renderBottomRow(theme: ToBem<ListCss>) {
        const {i18nPrefix = "focus", isManualFetch, showAllHandler} = this.props;
        if ((isManualFetch && this.hasMoreData) || showAllHandler) {
            return (
                <div className={theme.bottomRow()}>
                    {isManualFetch && this.hasMoreData ? (
                        <Button
                            onClick={() => this.handleShowMore()}
                            icon={getIcon(`${i18nPrefix}.icons.list.add`)}
                            label={this.showMoreLabel}
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
    }
}
