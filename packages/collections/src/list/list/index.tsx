import {autorun, comparer, observable, reaction} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {AnimatePresence} from "motion/react";
import {ComponentType, Fragment, useContext, useEffect} from "react";

import {CollectionStore} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import {BottomRow, ListBaseProps, usePagination} from "../base";
import {OperationListItem} from "../contextual-actions";
import {AddItemProps, DefaultAddItemComponent, DefaultEmptyComponent, EmptyProps} from "../shared";

import {ListContext} from "./context";
import {DetailProps, DetailWrapper} from "./detail";
import {LineProps, LineWrapper} from "./line";

import listCss, {ListCss} from "../__style__/list.css";

export {ListContext, listCss};
export type {DetailProps, LineProps, ListCss};

/** Props du composant de liste standard. */
export type ListProps<T extends object> = ListBaseProps<T> & {
    /** Composant personnalisé pour le bouton "Ajouter" en mode mosaïque. */
    AddItemComponent?: ComponentType<AddItemProps<NoInfer<T>>>;
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data: NoInfer<T>) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: ComponentType<DetailProps<NoInfer<T>>>;
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ComponentType<EmptyProps<NoInfer<T>>>;
    /** Cache le bouton "Ajouter" dans la mosaïque et le composant vide. */
    hideAdditionalItems?: boolean;
    /** Composant de ligne. */
    LineComponent?: ComponentType<LineProps<NoInfer<T>>>;
    /** Mode des listes dans le wrapper. Par défaut : celui du composant fourni, ou "list". */
    mode?: "list" | "mosaic";
    /** Taille de la mosaïque. */
    mosaic?: {width: number; height: number};
    /** Composant de mosaïque. */
    MosaicComponent?: ComponentType<LineProps<NoInfer<T>>>;
    /** La liste des actions sur chaque élément de la liste. */
    operationList?: (data: NoInfer<T>) => OperationListItem<NoInfer<T>>[];
    /** CSS. */
    theme?: CSSProp<ListCss>;
} & (
        | {
              /** Affiche la sélection sur les lignes. */
              hasSelection?: boolean;
              /** Le store contenant la liste. */
              store: CollectionStore<T>;
          }
        | {
              /** Les données du tableau. */
              data: T[];
              /** Affiche un indicateur de chargement après la liste. */
              isLoading?: boolean;
          }
    );

/**
 * Le composant `List`, généralement posé par la fonction `listFor`, permet d'afficher des données sous forme d'une liste simple.
 *
 * Comme tous les composants de listes :
 * - Il peut s'utiliser soit directement avec une liste de données passée dans la prop `data`, soit avec un [`CollectionStore`](/docs/listes-store-de-collection--docs) passé dans la prop `store`.
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `paginationMode`).
 *
 * La liste se base sur le `LineComponent` passé en props pour afficher les éléments de la liste, qui recevra dans sa prop `data` l'élément à afficher. La liste n'a
 * aucune mise en forme pré-définie pour ses éléments : l'ensemble du CSS nécessaire pour un affichage correct devra donc être porté par le `LineComponent`.
 *
 * Il est en revanche possible de définir des actions pour chaque ligne de la liste via `operationList` : ces actions seront posée sur la droite de chaque élément
 * au dessus du `LineComponent`.
 *
 * Lorsqu'elle est interfacée avec un [`CollectionStore`](/docs/listes-store-de-collection--docs), la liste peut aussi gérer de la sélection d'éléments, en renseignant `hasSelection`.
 *
 * La liste dispose également d'une série de fonctionnalités un peu spécifiques qui ont été développées il y a longtemps et qui ne sont pas entièrement
 * maintenues, à utiliser à vos risques et périls :
 * - Possibilité de définir un `MosaicComponent` et `mosaic` pour afficher les éléments comme une mosaïque au lieu d'une liste.
 * - Possibilité de définir un `DetailComponent` et `canOpenDetail` qui s'ouvrira après l'élément de la liste cliqué, pour afficher des informations
 *  complémentaires (il s'ouvre bien au bon endroit en mode mosaïque).
 * - Possibilité de définir un `addItemHandler` et son `AddItemComponent`, pour avoir un composant générique pour ajouter un nouvel élément (utile en
 *  particulier pour l'affichage mosaïque).
 *
 * **Ce composant n'a d'intérêt que si vous avez besoin d'une des fonctionnalités listées dans cette description** (la plupart du temps, il s'agit de la pagination, de
 * la sélection, ou des actions de ligne). Sans ça, il n'a aucun avantage sur un simple `list.map()` React classique et apporte une complexité inutile.
 */
export function List<T extends object>({
    AddItemComponent = DefaultAddItemComponent,
    addItemHandler,
    baseTheme,
    canOpenDetail = () => true,
    // @ts-ignore
    data,
    DetailComponent,
    EmptyComponent = DefaultEmptyComponent,
    // @ts-ignore
    hasSelection,
    hideAdditionalItems,
    i18nPrefix = "focus",
    // @ts-ignore
    isLoading,
    itemKey,
    LineComponent,
    mode,
    mosaic = {width: 200, height: 200},
    MosaicComponent,
    operationList,
    paginationMode = "single-auto",
    perPage,
    sentinelItemIndex = 5,
    showAllHandler,
    // @ts-ignore
    store,
    theme: pTheme
}: ListProps<T>) {
    const listContext = useContext(ListContext);
    const theme = useTheme("list", listCss, pTheme);
    const listState = useLocalObservable(
        () => ({
            _addItemHandler: addItemHandler,
            get addItemHandler() {
                return this._addItemHandler ?? listContext.addItemHandler;
            },

            _mode: mode,
            get mode() {
                return this._mode ?? listContext.mode ?? (MosaicComponent && !LineComponent ? "mosaic" : "list");
            },

            /** Nombre de mosaïque par ligne, déterminé à la volée. */
            byLine: 0,
            /** Index de l'item sur lequel on doit afficher le détail. */
            displayedIdx: undefined as number | undefined,
            /** Ref vers la liste pour déterminer sa largeur. */
            ulRef: null as HTMLUListElement | null,

            /** Toggle le détail depuis la ligne. */
            async toggleDetail(
                idx: number,
                {onOpen, onClose}: {onOpen?: () => Promise<void> | void; onClose?: () => Promise<void> | void} = {}
            ) {
                const displayedIdx = this.displayedIdx !== idx ? idx : undefined;
                if (displayedIdx !== undefined && onOpen) {
                    await onOpen();
                }
                if (displayedIdx === undefined && onClose) {
                    await onClose();
                }

                this.displayedIdx = displayedIdx;
            },

            /** Ferme le détail. */
            closeDetail() {
                this.displayedIdx = undefined;
            }
        }),
        {_addItemHandler: observable.ref}
    );

    useEffect(() => {
        listState._addItemHandler = addItemHandler;
        listState._mode = mode;
    }, [addItemHandler, mode]);

    /** Met à jour `byLine`. */
    useEffect(() => {
        const updateByLine = () => {
            if (listState.ulRef) {
                listState.byLine =
                    listState.mode === "mosaic" ? Math.floor(listState.ulRef.clientWidth / (mosaic.width + 10)) : 1;
            }
        };

        const disposer = autorun(updateByLine);
        window.addEventListener("resize", updateByLine);

        return () => {
            disposer();
            window.removeEventListener("resize", updateByLine);
        };
    }, []);

    const {getDomRef, state, ...pagination} = usePagination<T>({
        data,
        isLoading,
        paginationMode,
        perPage,
        sentinelItemIndex,
        store
    });

    return useObserver(() => {
        /** Réaction pour fermer le détail si la liste change. */
        useEffect(
            () =>
                reaction(() => state.displayedData.map(itemKey), listState.closeDetail, {
                    fireImmediately: true,
                    equals: comparer.structural
                }),
            []
        );

        /** Affiche ou non l'ajout d'élément dans la liste (en mosaïque). */
        const isAddItemShown = !!(!hideAdditionalItems && listState.addItemHandler && listState.mode === "mosaic");

        let Component: ComponentType<LineProps<T>>;
        if (listState.mode === "list" && LineComponent) {
            Component = LineComponent;
        } else if (listState.mode === "mosaic" && MosaicComponent) {
            Component = MosaicComponent;
        } else {
            throw new Error("Aucun component de ligne ou de mosaïque n'a été précisé.");
        }

        const detailIdx =
            listState.displayedIdx !== undefined
                ? listState.mode === "list"
                    ? listState.displayedIdx
                    : Math.min(
                          (Math.floor((listState.displayedIdx + (isAddItemShown ? 1 : 0)) / listState.byLine) + 1) *
                              listState.byLine -
                              (isAddItemShown ? 1 : 0) -
                              1,
                          state.displayedData.length - 1
                      )
                : undefined;

        const lines = state.displayedData.map((item, idx) => (
            <Fragment key={itemKey(item, idx)}>
                <LineWrapper
                    data={item}
                    domRef={getDomRef(idx)}
                    hasSelection={store ? hasSelection : undefined}
                    LineComponent={Component}
                    mosaic={listState.mode === "mosaic" ? mosaic : undefined}
                    operationList={operationList}
                    store={store}
                    theme={theme}
                    toggleDetail={
                        canOpenDetail(item) && DetailComponent
                            ? (callbacks?: {}) => listState.toggleDetail(idx, callbacks)
                            : undefined
                    }
                />
                {DetailComponent ? (
                    <AnimatePresence mode="wait">
                        {listState.displayedIdx !== undefined && idx === detailIdx ? (
                            <DetailWrapper
                                key={`detail-${listState.displayedIdx}`}
                                byLine={listState.byLine}
                                closeDetail={listState.closeDetail}
                                DetailComponent={DetailComponent}
                                displayedIdx={listState.displayedIdx}
                                isAddItemShown={isAddItemShown}
                                item={state.displayedData[listState.displayedIdx]}
                                mode={listState.mode}
                                mosaic={mosaic}
                                theme={theme}
                            />
                        ) : null}
                    </AnimatePresence>
                ) : null}
            </Fragment>
        ));

        return (
            <div
                className={theme.list({
                    mosaic: listState.mode === "mosaic",
                    selected: (store && store.selectionStatus !== "none") ?? false
                })}
            >
                {/* Gestion de l'empty state. */}
                {!state.isLoading && !hideAdditionalItems && !state.displayedData.length ? (
                    <EmptyComponent addItemHandler={listState.addItemHandler} i18nPrefix={i18nPrefix} store={store} />
                ) : (
                    <ul
                        ref={ul => {
                            listState.ulRef = ul;
                        }}
                    >
                        {/* On regarde si on doit ajouter l'élément d'ajout. */}
                        {isAddItemShown ? (
                            <li
                                key="mosaic-add"
                                className={theme.mosaic()}
                                style={{width: mosaic.width, height: mosaic.height}}
                            >
                                <AddItemComponent
                                    addItemHandler={listState.addItemHandler}
                                    i18nPrefix={i18nPrefix}
                                    mode="mosaic"
                                />
                            </li>
                        ) : null}
                        {lines}
                    </ul>
                )}
                <BottomRow
                    {...pagination}
                    i18nPrefix={i18nPrefix}
                    paginationMode={paginationMode}
                    perPage={perPage}
                    showAllHandler={showAllHandler}
                    state={state}
                    store={store}
                    theme={baseTheme}
                />
            </div>
        );
    });
}

/**
 * `listFor` permet de poser le composant `List`, qui permet d'afficher des données sous forme d'une liste simple.
 *
 * Comme tous les composants de listes :
 * - Il peut s'utiliser soit directement avec une liste de données passée dans la prop `data`, soit avec un [`CollectionStore`](/docs/listes-store-de-collection--docs) passé dans la prop `store`.
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `paginationMode`).
 *
 * La liste se base sur le `LineComponent` passé en props pour afficher les éléments de la liste, qui recevra dans sa prop `data` l'élément à afficher. La liste n'a
 * aucune mise en forme pré-définie pour ses éléments : l'ensemble du CSS nécessaire pour un affichage correct devra donc être porté par le `LineComponent`.
 *
 * Il est en revanche possible de définir des actions pour chaque ligne de la liste via `operationList` : ces actions seront posée sur la droite de chaque élément
 * au dessus du `LineComponent`.
 *
 * Lorsqu'elle est interfacée avec un [`CollectionStore`](/docs/listes-store-de-collection--docs), la liste peut aussi gérer de la sélection d'éléments, en renseignant `hasSelection`.
 *
 * La liste dispose également d'une série de fonctionnalités un peu spécifiques qui ont été développées il y a longtemps et qui ne sont pas entièrement
 * maintenues, à utiliser à vos risques et périls :
 * - Possibilité de définir un `MosaicComponent` et `mosaic` pour afficher les éléments comme une mosaïque au lieu d'une liste.
 * - Possibilité de définir un `DetailComponent` et `canOpenDetail` qui s'ouvrira après l'élément de la liste cliqué, pour afficher des informations
 *  complémentaires (il s'ouvre bien au bon endroit en mode mosaïque).
 * - Possibilité de définir un `addItemHandler` et son `AddItemComponent`, pour avoir un composant générique pour ajouter un nouvel élément (utile en
 *  particulier pour l'affichage mosaïque).
 *
 * **Ce composant n'a d'intérêt que si vous avez besoin d'une des fonctionnalités listées dans cette description** (la plupart du temps, il s'agit de la pagination, de
 * la sélection, ou des actions de ligne). Sans ça, il n'a aucun avantage sur un simple `list.map()` React classique et apporte une complexité inutile.
 */
export function listFor<T extends object>(props: ListProps<T>) {
    return <List<T> {...props} />;
}
