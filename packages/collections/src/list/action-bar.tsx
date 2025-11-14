import {action, reaction} from "mobx";
import {useObserver} from "mobx-react";
import {AnimatePresence, motion} from "motion/react";
import {ReactElement, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

import {CollectionStore, SortInput} from "@focus4/stores";
import {CSSProp, getDefaultTransition, useTheme} from "@focus4/styling";
import {Button, Checkbox, IconButton, Menu, MenuItem, MenuProps, TextField, useMenu} from "@focus4/toolbox";

import {AdditionalFacet, FacetBox, shouldDisplayFacet} from "../search";

import {ContextualActions, OperationListItem} from "./contextual-actions";

import actionBarCss, {ActionBarCss} from "./__style__/action-bar.css";

export {actionBarCss};
export type {ActionBarCss};

/** Props de l'ActionBar. */
export interface ActionBarProps<T extends object> {
    /** Composants additionnels à afficher dans la FacetBox, pour y intégrer des filtres par exemple.  */
    additionalFacets?: {
        [facet: string]: AdditionalFacet;
    };
    /** Facettes pliées par défaut. */
    defaultFoldedFacets?: string[];
    /** Constitution de l'éventuel groupe auquel est lié l'ActionBar */
    group?: {code: string; label: string; totalCount: number};
    /** Si renseignée, seules les facettes de cette liste pourront être sélectionnées comme groupingKey. */
    groupableFacets?: string[];
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
    /** Positions des menus (boutons de tri et de groupe) */
    menuPositions?: MenuProps["position"];
    /** Nombre de valeurs de facettes affichées. Par défaut : 6 */
    nbDefaultDataListFacet?: number;
    /** Liste des colonnes sur lesquels on peut trier. */
    orderableColumnList?: {label: string; sort: SortInput[]}[];
    /** Actions sur les éléments sélectionnés. */
    operationList?: OperationListItem<T[]>[];
    /** Placeholder pour la barre de recherche. */
    searchBarPlaceholder?: string;
    /** Affiche les facettes qui n'ont qu'une seule valeur. */
    showSingleValuedFacets?: boolean;
    /** Store associé. */
    store: CollectionStore<T>;
    /** CSS. */
    theme?: CSSProp<ActionBarCss>;
}

/**
 * C'est le composant principal pour piloter un store (liste ou recherche). On y retrouve, dans l'ordre :
 *
 * - La case à cocher de sélection (si `hasSelection = true`).
 * - Le menu de tri (si `orderableColumnList` a été renseigné).
 * - Le bouton d'ouverture des filtres (si `hasFacetBox = true`).
 * - Le menu de groupe (si `hasGroup = true`).
 * - La barre de recherche (si `hasSearchBar = true`)
 * - Les actions de sélection (si au moins un élément est sélectionné et que `operationList` a été renseigné).
 *
 * Lorsqu'un élément au moins a été sélectionné, toutes les autres actions disparaissent pour afficher le nombre d'éléments sélectionnés à la place.
 * Ces mêmes actions sont absentes de l'ActionBar d'un groupe et le nom du groupe est affiché à la place.
 */
export function ActionBar<T extends object>({
    additionalFacets,
    defaultFoldedFacets,
    group,
    groupableFacets,
    hasFacetBox,
    hasGrouping,
    hasSearchBar,
    hasSelection,
    i18nPrefix = "focus",
    menuPositions,
    nbDefaultDataListFacet = 6,
    operationList,
    orderableColumnList,
    searchBarPlaceholder,
    showSingleValuedFacets,
    store,
    theme: pTheme
}: ActionBarProps<T>) {
    /** Affiche la FacetBox. */
    const [displayFacetBox, setDisplayFacetBox] = useState(false);

    const {t} = useTranslation();
    const theme = useTheme("actionBar", actionBarCss, pTheme);
    const groupMenu = useMenu();
    const sortMenu = useMenu();

    function groupButton() {
        if (hasGrouping && !store.selectedItems.size && !store.groupingKey) {
            const groupableColumnList: Record<string, string> = store.facets
                ? store.facets.reduce((result, facet) => {
                      if (
                          // On ne peut pas grouper sur des facettes avec une seule valeur (qui sont d'ailleurs masquées par défaut).
                          facet.values.length > 1 &&
                          // Ni sur une facette sélectionnée.
                          !Object.keys(store.inputFacets).includes(facet.code) &&
                          // Et on ne garde que les facettes demandées dans la liste.
                          (!groupableFacets || groupableFacets.some(code => code === facet.code))
                      ) {
                          return {...result, [facet.code]: facet.label};
                      }
                      return result;
                  }, {})
                : {};

            const menuItems = Object.entries(groupableColumnList).reduce(
                (oL, [key, label]) => [
                    ...oL,
                    <MenuItem key={key} caption={t(label)} onClick={() => (store.groupingKey = key)} />
                ],
                [] as ReactElement[]
            );

            if (menuItems.length) {
                return (
                    <div ref={groupMenu.anchor} style={{position: "relative"}}>
                        <Button
                            icon={
                                groupMenu.active
                                    ? {i18nKey: `${i18nPrefix}.icons.actionBar.dropup`}
                                    : {i18nKey: `${i18nPrefix}.icons.actionBar.dropdown`}
                            }
                            iconPosition="right"
                            label={t(`${i18nPrefix}.search.action.group`)}
                            onClick={() => {
                                groupMenu.toggle();
                                setDisplayFacetBox(false);
                            }}
                        />
                        <Menu {...groupMenu} position={menuPositions}>
                            {menuItems}
                        </Menu>
                    </div>
                );
            }
        }

        return null;
    }

    /** Réaction permettant de fermer la FacetBox et de mettre à jour sa hauteur à chaque fois que c'est nécessaire (changement de son contenu).  */
    useEffect(
        () =>
            reaction(
                () => hasFacetBox && store.facets.length && store.facets[0],
                () => {
                    // On ferme la FacetBox si on se rend compte qu'on va afficher une FacetBox vide.
                    if (
                        displayFacetBox &&
                        store.facets.every(
                            facet =>
                                !shouldDisplayFacet(facet, store.inputFacets, showSingleValuedFacets, store.totalCount)
                        )
                    ) {
                        setDisplayFacetBox(false);
                    }
                },
                {fireImmediately: true}
            ),
        [displayFacetBox, hasFacetBox, showSingleValuedFacets, store]
    );

    return useObserver(() => (
        <div className={theme.container()}>
            {/* ActionBar en tant que telle. */}
            <div className={theme.bar({selection: !!store.selectedItems.size})}>
                <div className={theme.buttons()}>
                    {/** Bouton de sélection (case à cocher). */}
                    {hasSelection ? (
                        <Checkbox
                            indeterminate={store.selectionStatus === "partial"}
                            onChange={store.toggleAll}
                            theme={{checkbox: theme.selectionToggle()}}
                            value={store.selectionStatus !== "none"}
                        />
                    ) : null}

                    {/** Eléments sélectionnés */}
                    {group ? <strong>{`${t(group.label)} (${group.totalCount})`}</strong> : null}
                    {store.selectedItems.size ? (
                        <strong>{`${store.selectedItems.size} ${t(`${i18nPrefix}.search.action.selectedItem`, {
                            count: store.selectedItems.size
                        })}`}</strong>
                    ) : null}

                    {/** Bouton permettant d'afficher le panneau dépliant contenant la FacetBox (si demandé). */}
                    {hasFacetBox &&
                    (store.facets.some(facet =>
                        shouldDisplayFacet(facet, store.inputFacets, showSingleValuedFacets, store.totalCount)
                    ) ||
                        additionalFacets) ? (
                        <div style={{position: "relative"}}>
                            <Button
                                icon={{
                                    i18nKey: `${i18nPrefix}.icons.actionBar.drop${displayFacetBox ? "up" : "down"}`
                                }}
                                iconPosition="right"
                                label={t(`${i18nPrefix}.search.action.filter`)}
                                onClick={() => setDisplayFacetBox(!displayFacetBox)}
                            />
                        </div>
                    ) : null}

                    {/** Bouton de tri. */}
                    {store.totalCount > 1 && !store.selectedItems.size && !store.groupingKey && orderableColumnList ? (
                        <div ref={sortMenu.anchor} style={{position: "relative"}}>
                            <Button
                                icon={
                                    sortMenu.active
                                        ? {i18nKey: `${i18nPrefix}.icons.actionBar.dropup`}
                                        : {i18nKey: `${i18nPrefix}.icons.actionBar.dropdown`}
                                }
                                iconPosition="right"
                                label={t(`${i18nPrefix}.search.action.sort`)}
                                onClick={() => {
                                    sortMenu.toggle();
                                    setDisplayFacetBox(false);
                                }}
                            />
                            <Menu {...sortMenu} position={menuPositions}>
                                {orderableColumnList.map((description, idx) => (
                                    <MenuItem
                                        key={idx}
                                        caption={t(description.label)}
                                        onClick={action("sort", () => {
                                            store.sort = description.sort;
                                        })}
                                    />
                                ))}
                            </Menu>
                        </div>
                    ) : null}

                    {/** Bouton de groupe. */}
                    {groupButton()}

                    {/** Barre de recherche */}
                    {!store.selectedItems.size && hasSearchBar ? (
                        <div className={theme.searchBar()}>
                            <TextField
                                hint={searchBarPlaceholder}
                                icon={{i18nKey: `${i18nPrefix}.icons.actionBar.search`}}
                                onChange={(text: string) => (store.query = text)}
                                trailing={
                                    store.query
                                        ? [
                                              {
                                                  icon: {i18nKey: `${i18nPrefix}.icons.actionBar.close`},
                                                  onClick: () => (store.query = "")
                                              }
                                          ]
                                        : []
                                }
                                value={store.query}
                            />
                        </div>
                    ) : null}
                </div>
                {operationList ? (
                    <ContextualActions
                        data={[...store.selectedItems]}
                        operationList={operationList.filter(o => !!store.selectedItems.size || o.showIfNoData)}
                    />
                ) : null}
            </div>
            {/* FacetBox */}
            {hasFacetBox ? (
                <div className={theme.facetBoxContainer()}>
                    <AnimatePresence>
                        {displayFacetBox ? (
                            <motion.div
                                key="facet-box"
                                animate={{height: "auto"}}
                                exit={{height: 0}}
                                initial={{height: 0}}
                                transition={getDefaultTransition()}
                            >
                                <IconButton
                                    icon={{i18nKey: `${i18nPrefix}.icons.actionBar.close`}}
                                    onClick={() => setDisplayFacetBox(false)}
                                />
                                <FacetBox
                                    additionalFacets={additionalFacets}
                                    defaultFoldedFacets={defaultFoldedFacets}
                                    nbDefaultDataList={nbDefaultDataListFacet}
                                    showSingleValuedFacets={showSingleValuedFacets}
                                    store={store}
                                    theme={{facetBox: theme.facetBox()}}
                                />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            ) : null}
        </div>
    ));
}
