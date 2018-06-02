import i18next from "i18next";
import {reduce} from "lodash";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {Motion, spring} from "react-motion";
import {Button, IconButton} from "react-toolbox/lib/button";
import {Input} from "react-toolbox/lib/input";

import {ButtonMenu, getIcon, MenuItem} from "../../../components";
import {themr} from "../../../theme";
import {classReaction} from "../../../util";

import {isList, isSearch, ListStoreBase} from "../../store";
import {FacetBox, shouldDisplayFacet} from "../search";
import {ContextualActions, OperationListItem} from "./contextual-actions";

import * as styles from "./__style__/action-bar.css";
export type ActionBarStyle = Partial<typeof styles>;
const Theme = themr("actionBar", styles);

const MIN_FACETBOX_HEIGHT = 80;
const DEFAULT_FACETBOX_MARGIN = 1000;

/** Props de l'ActionBar. */
export interface ActionBarProps<T> {
    /** Constituion de l'éventuel groupe auquel est lié l'ActionBar */
    group?: {code: string; label: string; totalCount: number};
    /** Contient une FacetBox. */
    hasFacetBox?: boolean;
    /** Affiche le bouton de groupe. */
    hasGrouping?: boolean;
    /** Affiche la barre de recherche. */
    hasSearchBar?: boolean;
    /** Affiche la case pour la sélection. */
    hasSelection?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    /** Liste des colonnes sur lesquels on peut trier. */
    orderableColumnList?: {key: string; label: string; order: boolean}[];
    /** Actions sur les éléments sélectionnés. */
    operationList?: OperationListItem<T[]>[];
    /** Placeholder pour la barre de recherche. */
    searchBarPlaceholder?: string;
    /** Affiche les facettes qui n'ont qu'une seule valeur. */
    showSingleValuedFacets?: boolean;
    /** Store associé. */
    store: ListStoreBase<T>;
    /** CSS. */
    theme?: ActionBarStyle;
}

/** Barre d'actions pour une liste ou un groupe de recherche. Permet le tri, le grouping, la recherche et la sélection + actions en masse. */
@observer
export class ActionBar<T> extends React.Component<ActionBarProps<T>> {
    /** Affiche la FacetBox. */
    @observable displayFacetBox = false;
    /** Hauteur de la FacetBox. */
    @observable facetBoxHeight = DEFAULT_FACETBOX_MARGIN;

    /** Div contenant la facet box. */
    protected facetBox?: HTMLDivElement | null;

    /** Bouton de sélection (case à cocher). */
    protected selectionButton(theme: ActionBarStyle) {
        const {hasSelection, i18nPrefix = "focus", store} = this.props;
        if (hasSelection) {
            return (
                <IconButton
                    icon={getIcon(`${i18nPrefix}.icons.actionBar.${store.selectionStatus}`)}
                    onClick={store.toggleAll}
                    theme={{toggle: theme.selectionToggle, icon: theme.selectionIcon}}
                />
            );
        } else {
            return null;
        }
    }

    /** Bouton permettant d'afficher le panneau dépliant contenant la FacetBox (si demandé). */
    protected filterButton(theme: ActionBarStyle) {
        const {hasFacetBox, showSingleValuedFacets, i18nPrefix = "focus", store} = this.props;
        if (
            hasFacetBox &&
            isSearch(store) &&
            store.facets.some(facet => shouldDisplayFacet(facet, store.selectedFacets, showSingleValuedFacets))
        ) {
            return (
                <div style={{position: "relative"}}>
                    <Button
                        onClick={() => (this.displayFacetBox = !this.displayFacetBox)}
                        icon={getIcon(`${i18nPrefix}.icons.actionBar.drop${this.displayFacetBox ? "up" : "down"}`)}
                        theme={{icon: theme.dropdown}}
                        label={i18next.t(`${i18nPrefix}.search.action.filter`)}
                    />
                    {this.displayFacetBox ? <div className={theme.triangle} /> : null}
                </div>
            );
        } else {
            return null;
        }
    }

    /** Bouton de tri. */
    protected sortButton(theme: ActionBarStyle) {
        const {i18nPrefix = "focus", orderableColumnList, store} = this.props;

        if (
            store.totalCount > 1 &&
            !store.selectedItems.size &&
            ((isSearch(store) && !store.groupingKey) || isList(store)) &&
            orderableColumnList
        ) {
            return (
                <ButtonMenu
                    button={{
                        label: i18next.t(`${i18nPrefix}.search.action.sort`),
                        icon: getIcon(`${i18nPrefix}.icons.actionBar.dropdown`),
                        openedIcon: getIcon(`${i18nPrefix}.icons.actionBar.dropup`),
                        theme: {icon: theme.dropdown}
                    }}
                    onClick={() => (this.displayFacetBox = false)}
                >
                    {orderableColumnList.map((description, idx) => (
                        <MenuItem
                            key={idx}
                            onClick={action("sort", () => {
                                store.sortBy = description.key;
                                store.sortAsc = description.order;
                            })}
                            caption={i18next.t(description.label)}
                        />
                    ))}
                </ButtonMenu>
            );
        }

        return null;
    }

    /** Bouton de groupe. */
    protected groupButton(theme: ActionBarStyle) {
        const {hasGrouping, i18nPrefix = "focus", store} = this.props;

        if (hasGrouping && isSearch(store) && !store.selectedItems.size && !store.groupingKey) {
            const groupableColumnList = store.facets
                ? store.facets.reduce((result, facet) => {
                      // On ne peut pas grouper sur des facettes avec une seule valeur (qui sont d'ailleurs masquées par défaut).
                      if (facet.values.length > 1) {
                          return {...result, [facet.code]: facet.label};
                      }
                      return result;
                  }, {})
                : {};

            const menuItems = reduce(
                groupableColumnList,
                (operationList, label, key) => [
                    ...operationList,
                    <MenuItem key={key} onClick={() => (store.groupingKey = key)} caption={i18next.t(label)} />
                ],
                [] as JSX.Element[]
            );

            if (menuItems.length) {
                return (
                    <ButtonMenu
                        button={{
                            label: i18next.t(`${i18nPrefix}.search.action.group`),
                            icon: getIcon(`${i18nPrefix}.icons.actionBar.dropdown`),
                            openedIcon: getIcon(`${i18nPrefix}.icons.actionBar.dropup`),
                            theme: {icon: theme.dropdown}
                        }}
                        onClick={() => (this.displayFacetBox = false)}
                    >
                        {menuItems}
                    </ButtonMenu>
                );
            }
        }

        return null;
    }

    /** Barre de recherche. */
    protected searchBar(theme: ActionBarStyle) {
        const {i18nPrefix = "focus", hasSearchBar, searchBarPlaceholder, store} = this.props;

        if (!store.selectedItems.size && hasSearchBar && (isList(store) || isSearch(store))) {
            return (
                <div className={theme.searchBar}>
                    <Input
                        icon={getIcon(`${i18nPrefix}.icons.actionBar.search`)}
                        value={store.query}
                        onChange={(text: string) => (store.query = text)}
                        hint={searchBarPlaceholder}
                        theme={{input: theme.searchBarField, icon: theme.searchBarIcon, hint: theme.searchBarHint}}
                    />
                    {store.query ? (
                        <IconButton
                            icon={getIcon(`${i18nPrefix}.icons.actionBar.close`)}
                            onClick={() => (store.query = "")}
                        />
                    ) : null}
                </div>
            );
        }

        return null;
    }

    /** Réaction permettant de fermer la FacetBox et de mettre à jour sa hauteur à chaque fois que c'est nécessaire (changement de son contenu).  */
    @classReaction<ActionBar<T>>(that => () => {
        const {hasFacetBox, store} = that.props;
        return (hasFacetBox && isSearch(store) && store.facets.length && store.facets[0]) || false;
    })
    protected closeFacetBox() {
        const {store, showSingleValuedFacets} = this.props;

        // La hauteur de la FacetBox est utilisée pour la refermer correctement, puisqu'on anime sa propriété `margin-top`.
        if (!this.displayFacetBox) {
            this.facetBoxHeight = DEFAULT_FACETBOX_MARGIN;
        }

        // On ferme la FacetBox si on se rend compte qu'on va afficher une FacetBox vide.
        if (
            this.displayFacetBox &&
            isSearch(store) &&
            store.facets.every(facet => !shouldDisplayFacet(facet, store.selectedFacets, showSingleValuedFacets))
        ) {
            this.displayFacetBox = false;
        }
    }

    componentDidMount() {
        this.updateFacetBoxHeight();
    }

    componentDidUpdate() {
        this.updateFacetBoxHeight();
    }

    /** On maintient également la hauteur de la FacetBox en permanance.  */
    protected updateFacetBoxHeight() {
        if (this.facetBox && this.facetBox.clientHeight > MIN_FACETBOX_HEIGHT) {
            this.facetBoxHeight = this.facetBox.clientHeight;
        }
    }

    render() {
        const {
            group,
            hasFacetBox,
            i18nPrefix = "focus",
            nbDefaultDataListFacet = 6,
            operationList,
            showSingleValuedFacets,
            store
        } = this.props;
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <div className={theme.container}>
                        {/* ActionBar en tant que telle. */}
                        <div className={`${theme.bar} ${store.selectedItems.size ? theme.selection : ""}`}>
                            <div className={theme.buttons}>
                                {this.selectionButton(theme)}
                                {group ? <strong>{`${i18next.t(group.label)} (${group.totalCount})`}</strong> : null}
                                {store.selectedItems.size ? (
                                    <strong>{`${store.selectedItems.size} ${i18next.t(
                                        `${i18nPrefix}.search.action.selectedItem${
                                            store.selectedItems.size > 1 ? "s" : ""
                                        }`
                                    )}`}</strong>
                                ) : null}
                                {this.filterButton(theme)}
                                {this.sortButton(theme)}
                                {this.groupButton(theme)}
                                {this.searchBar(theme)}
                            </div>
                            {store.selectedItems.size && operationList && operationList.length ? (
                                <ContextualActions
                                    operationList={operationList}
                                    data={Array.from(store.selectedItems)}
                                />
                            ) : null}
                        </div>
                        {/* FacetBox */}
                        {hasFacetBox && isSearch(store) ? (
                            <div className={theme.facetBoxContainer}>
                                <Motion
                                    style={{
                                        marginTop:
                                            this.facetBoxHeight === DEFAULT_FACETBOX_MARGIN
                                                ? -this.facetBoxHeight
                                                : spring(this.displayFacetBox ? 5 : -this.facetBoxHeight)
                                    }}
                                >
                                    {(style: {marginTop?: number}) => (
                                        <div style={style} ref={i => (this.facetBox = i)}>
                                            <IconButton
                                                icon={getIcon(`${i18nPrefix}.icons.actionBar.close`)}
                                                onClick={() => (this.displayFacetBox = false)}
                                            />
                                            <FacetBox
                                                theme={{facetBox: theme.facetBox}}
                                                nbDefaultDataList={nbDefaultDataListFacet}
                                                showSingleValuedFacets={showSingleValuedFacets}
                                                store={store}
                                            />
                                        </div>
                                    )}
                                </Motion>
                            </div>
                        ) : null}
                    </div>
                )}
            </Theme>
        );
    }
}

/**
 * Crée une ActionBar.
 * @param props Les props de l'ActionBar.
 */
export function actionBarFor<T>(props: ActionBarProps<T>) {
    return <ActionBar {...props} />;
}
