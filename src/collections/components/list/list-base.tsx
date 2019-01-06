import i18next from "i18next";
import {action, computed, observable} from "mobx";
import * as React from "react";
import {findDOMNode} from "react-dom";
import {Button} from "react-toolbox/lib/button";

import {getIcon} from "../../../components";

import {LineStyle} from "./line";

import * as styles from "./__style__/list.css";
export type ListStyle = Partial<typeof styles>;

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
    /** Décalage entre le scroll et le bas de la page en dessous du quel on déclenche le chargement en scroll infini. Par défaut : 250. */
    offset?: number;
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage?: number;
    /** Affiche un bouton "Voir tout" qui effectue cette action. */
    showAllHandler?: () => void;
    /** CSS */
    theme?: ListStyle;
}

/** Classe de base pour toutes les listes Focus. Gère la pagination et le chargement. */
export abstract class ListBase<T, P extends ListBaseProps<T>> extends React.Component<P> {
    /** Nombre d'éléments affichés. */
    @observable displayedCount = this.props.perPage;

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

    protected get shouldAttachScrollListener() {
        const {isManualFetch, perPage} = this.props;
        return !!(!isManualFetch && perPage);
    }

    componentDidMount() {
        if (this.shouldAttachScrollListener) {
            this.attachScrollListener();
        }
    }

    componentWillUnmount() {
        if (this.shouldAttachScrollListener) {
            this.detachScrollListener();
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
    protected renderBottomRow(theme: ListStyle) {
        const {i18nPrefix = "focus", isManualFetch, showAllHandler} = this.props;
        if ((isManualFetch && this.hasMoreData) || showAllHandler) {
            return (
                <div className={theme.bottomRow}>
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

    /** Enregistre un listener sur le scroll pour le scroll infini. */
    private attachScrollListener() {
        window.addEventListener("scroll", this.scrollListener);
        window.addEventListener("resize", this.scrollListener);
    }

    /** Retire les listeners. */
    private detachScrollListener() {
        window.removeEventListener("scroll", this.scrollListener);
        window.removeEventListener("resize", this.scrollListener);
    }

    /** Gère le scroll infini. */
    @action.bound
    private scrollListener() {
        const el = findDOMNode(this) as HTMLElement;
        const scrollTop = window.pageYOffset;
        if (topOfElement(el) + el.offsetHeight - scrollTop - window.innerHeight < (this.props.offset || 250)) {
            this.handleShowMore();
        }
    }
}

/**
 * Détermine le sommet de l'élément choisi.
 * @param element L'élément.
 */
function topOfElement(element: HTMLElement): number {
    if (!element) {
        return 0;
    }
    return element.offsetTop + topOfElement(element.offsetParent as HTMLElement);
}
