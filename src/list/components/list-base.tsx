import {autobind} from "core-decorators";
import i18n from "i18next";
import {computed, observable} from "mobx";
import * as React from "react";
import {findDOMNode} from "react-dom";

import Button from "focus-components/button";

import {LineStyle} from "./line";

import * as styles from "./__style__/list.css";
export type ListStyle = Partial<typeof styles>;

/** Props de base pour un composant de liste. */
export interface ListBaseProps<T, P extends {data?: T}> {
    /** CSS de la ligne. */
    lineTheme?: LineStyle;
    /** Props propre à la ligne (hors `data`). */
    lineProps?: P;
    /** Préfixe i18n pour les libellés de la liste. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Affiche le bouton "Voir plus" au lieu d'un scroll infini. */
    isManualFetch?: boolean;
    /** Champ de l'objet à utiliser pour la key des lignes. */
    itemKey?: keyof T;
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
@autobind
export abstract class ListBase<T, P extends ListBaseProps<T, {data?: T}>> extends React.Component<P, void> {

    /** Nombre d'éléments affichés. */
    @observable maxElements = this.props.perPage;
    /** Nombre de page chargées. */
    private page = 1;

    /** Les données. */
    protected abstract get data(): T[];

    /** Les données affichées. */
    @computed
    protected get displayedData() {
        if (this.maxElements) {
            return this.data.slice(0, this.maxElements);
        } else {
            return this.data;
        }
    }

    /** Détermine s'il y a encore des données non affichées. */
    @computed
    protected get hasMoreData() {
        if (this.maxElements) {
            return this.data.length > this.maxElements;
        } else {
            return false;
        }
    }

    componentDidMount() {
        const {isManualFetch, perPage} = this.props;
        if (!isManualFetch && perPage) {
            this.attachScrollListener();
        }
    }

    componentDidUpdate() {
        this.componentDidMount();
    }

    componentWillUnmount() {
        const {isManualFetch, perPage} = this.props;
        if (!isManualFetch && perPage) {
            this.detachScrollListener();
        }
    }

    /** Affiche les éventuels boutons "Voir plus" et "Voir tout" en fin de liste. */
    protected renderBottomRow() {
        const {theme, i18nPrefix = "focus", isManualFetch, showAllHandler} = this.props;
        if (isManualFetch && this.hasMoreData || showAllHandler) {
            return (
                <div className={theme!.bottomRow!}>
                    {isManualFetch && this.hasMoreData ?
                        <Button
                            handleOnClick={this.handleShowMore}
                            icon={i18n.t(`${i18nPrefix}.icons.list.add.name`)}
                            iconLibrary={i18n.t(`${i18nPrefix}.icons.list.add.library`)}
                            shape={null}
                            type="button"
                            label={`${i18n.t(`${i18nPrefix}.list.show.more`)} (${this.displayedData.length} / ${this.data.length} ${i18n.t(`${i18nPrefix}.list.show.displayed`)})`}
                        />
                    : <div />}
                    {showAllHandler ?
                        <Button
                            handleOnClick={showAllHandler}
                            icon={i18n.t(`${i18nPrefix}.icons.list.showAll.name`)}
                            iconLibrary={i18n.t(`${i18nPrefix}.icons.list.showAll.library`)}
                            label={`${i18nPrefix}.list.show.all`}
                            type="button"
                            shape={null}
                        />
                    : null}
                </div>
            );
        } else {
            return null;
        }
    }

    /** Charge la page suivante. */
    protected handleShowMore() {
        if (this.hasMoreData) {
            this.page = this.page + 1;
            this.maxElements = (this.props.perPage || 5) * this.page;
        }
    }

    /** Enregistre un listener sur le scroll pour le scroll infini. */
    private attachScrollListener() {
        if (!this.hasMoreData) {
            return;
        }
        window.addEventListener("scroll", this.scrollListener);
        window.addEventListener("resize", this.scrollListener);
        this.scrollListener();
    }

    /** Retire les listeners. */
    private detachScrollListener() {
        window.removeEventListener("scroll", this.scrollListener);
        window.removeEventListener("resize", this.scrollListener);
    }

    /** Gère le scroll infini. */
    private scrollListener() {
        const el = findDOMNode(this) as HTMLElement;
        const scrollTop = window.pageYOffset;
        if (topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight) < (this.props.offset || 250)) {
            this.detachScrollListener();
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
    return element.offsetTop + topOfElement((element.offsetParent as HTMLElement));
}
