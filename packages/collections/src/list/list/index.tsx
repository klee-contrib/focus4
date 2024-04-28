import {AnimatePresence} from "framer-motion";
import {autorun, comparer, observable, reaction} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {ComponentType, Fragment, useContext, useEffect} from "react";

import {CollectionStore} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import {OperationListItem} from "../contextual-actions";
import {DndDragLayer, DragLayerCss} from "../drag-layer";
import {ListBaseProps, useListBase} from "../list-base";
import {
    AddItemProps,
    DefaultAddItemComponent,
    DefaultEmptyComponent,
    DefaultLoadingComponent,
    EmptyProps,
    LoadingProps
} from "../shared";

import {ListContext} from "./context";
import {DetailProps, DetailWrapper} from "./detail";
import {LineProps, LineWrapper} from "./line";

export {DetailProps, LineProps, ListContext};

import listCss, {ListCss} from "../__style__/list.css";
export {listCss, ListCss};

/** Props du composant de liste standard. */
export type ListProps<T> = Omit<ListBaseProps<NoInfer<T>>, "isLoading"> & {
    /** Composant personnalisé pour le bouton "Ajouter". */
    AddItemComponent?: ComponentType<AddItemProps<NoInfer<T>>>;
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data: NoInfer<T>) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: ComponentType<DetailProps<NoInfer<T>>>;
    /** Nombre d'éléments à partir du quel on n'affiche plus d'animation de drag and drop sur les lignes. */
    disableDragAnimThreshold?: number;
    /** Type de l'item de liste pour le drag and drop. Par défaut : "item". */
    dragItemType?: string;
    /** CSS du DragLayer. */
    dragLayerTheme?: CSSProp<DragLayerCss>;
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ComponentType<EmptyProps<NoInfer<T>>>;
    /** Active le drag and drop. */
    hasDragAndDrop?: boolean;
    /** Cache le bouton "Ajouter" dans la mosaïque et le composant vide. */
    hideAdditionalItems?: boolean;
    /** Composant de ligne. */
    LineComponent?: ComponentType<LineProps<NoInfer<T>>>;
    /** Composant à afficher pendant le chargement. */
    LoadingComponent?: ComponentType<LoadingProps<NoInfer<T>>>;
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
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `isManualFetch`).
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
 * - Possibilité de définir les éléments de la liste comme des [sources de drag and drop](https://react-dnd.github.io/react-dnd/docs/api/use-drag) (via `hasDragAndDrop`)
 *
 * **Ce composant n'a d'intérêt que si vous avez besoin d'une des fonctionnalités listées dans cette description** (la plupart du temps, il s'agit de la pagination, de
 * la sélection, ou des actions de ligne). Sans ça, il n'a aucun avantage sur un simple `list.map()` React classique et apporte une complexité inutile.
 */
export function List<T>({
    AddItemComponent = DefaultAddItemComponent,
    addItemHandler,
    canOpenDetail = () => true,
    DetailComponent,
    disableDragAnimThreshold,
    dragItemType,
    dragLayerTheme,
    EmptyComponent = DefaultEmptyComponent,
    hasDragAndDrop,
    // @ts-ignore
    hasSelection,
    hideAdditionalItems,
    LineComponent,
    LoadingComponent = DefaultLoadingComponent,
    mode,
    mosaic = {width: 200, height: 200},
    MosaicComponent,
    operationList,
    theme: pTheme,
    ...baseProps
}: ListProps<T>) {
    const listContext = useContext(ListContext);
    const theme = useTheme("list", listCss, pTheme);
    const state = useLocalObservable(
        () => ({
            _addItemHandler: addItemHandler,
            get addItemHandler() {
                return state._addItemHandler ?? listContext.addItemHandler;
            },

            _mode: mode,
            get mode() {
                return state._mode ?? listContext.mode ?? (MosaicComponent && !LineComponent ? "mosaic" : "list");
            },

            /** Nombre de mosaïque par ligne, déterminé à la volée. */
            byLine: 0,
            /** Index de l'item sur lequel on doit afficher le détail. */
            displayedIdx: undefined as number | undefined,
            /** Ref vers la liste pour déterminer sa largeur. */
            ulRef: null as HTMLUListElement | null,
            /** Liste des éléments sélectionnés par le drag and drop. */
            draggedItems: observable<T>([], {deep: false}),

            /** Toggle le détail depuis la ligne. */
            async toggleDetail(
                idx: number,
                {onOpen, onClose}: {onOpen?: () => Promise<void> | void; onClose?: () => Promise<void> | void} = {}
            ) {
                const displayedIdx = state.displayedIdx !== idx ? idx : undefined;
                if (displayedIdx !== undefined && onOpen) {
                    await onOpen();
                }
                if (displayedIdx === undefined && onClose) {
                    await onClose();
                }

                state.displayedIdx = displayedIdx;
            },

            /** Ferme le détail. */
            closeDetail() {
                state.displayedIdx = undefined;
            }
        }),
        {_addItemHandler: observable.ref}
    );

    useEffect(() => {
        state._addItemHandler = addItemHandler;
        state._mode = mode;
    }, [addItemHandler, mode]);

    /** Met à jour `byLine`. */
    useEffect(() => {
        const updateByLine = () => {
            if (state.ulRef) {
                state.byLine = state.mode === "mosaic" ? Math.floor(state.ulRef.clientWidth / (mosaic.width + 10)) : 1;
            }
        };

        const disposer = autorun(updateByLine);
        window.addEventListener("resize", updateByLine);

        return () => {
            disposer();
            window.removeEventListener("resize", updateByLine);
        };
    }, []);

    return useObserver(() => {
        const {bottomRow, displayedData, getDomRef, i18nPrefix, isLoading, itemKey, store} = useListBase(baseProps);

        /** Réaction pour fermer le détail si la liste change. */
        useEffect(
            () =>
                reaction(() => displayedData.map(itemKey), state.closeDetail, {
                    fireImmediately: true,
                    equals: comparer.structural
                }),
            []
        );

        /** Affiche ou non l'ajout d'élément dans la liste (en mosaïque). */
        const isAddItemShown = !!(!hideAdditionalItems && state.addItemHandler && state.mode === "mosaic");

        /** Désactive l'animation de drag and drop sur les lignes. */
        const disableDragAnimation =
            disableDragAnimThreshold === undefined ? false : disableDragAnimThreshold <= displayedData.length;

        let Component: ComponentType<LineProps<T>>;
        if (state.mode === "list" && LineComponent) {
            Component = LineComponent;
        } else if (state.mode === "mosaic" && MosaicComponent) {
            Component = MosaicComponent;
        } else {
            throw new Error("Aucun component de ligne ou de mosaïque n'a été précisé.");
        }

        const detailIdx =
            state.displayedIdx !== undefined
                ? state.mode === "list"
                    ? state.displayedIdx
                    : Math.min(
                          (Math.floor((state.displayedIdx + (isAddItemShown ? 1 : 0)) / state.byLine) + 1) *
                              state.byLine -
                              (isAddItemShown ? 1 : 0) -
                              1,
                          displayedData.length - 1
                      )
                : undefined;

        const lines = displayedData.map((item, idx) => (
            <Fragment key={itemKey(item, idx)}>
                <LineWrapper
                    data={item}
                    disableDragAnimation={disableDragAnimation}
                    domRef={getDomRef(idx)}
                    draggedItems={hasDragAndDrop ? state.draggedItems : undefined}
                    dragItemType={dragItemType}
                    hasSelection={store ? hasSelection : undefined}
                    LineComponent={Component}
                    mosaic={state.mode === "mosaic" ? mosaic : undefined}
                    operationList={operationList}
                    store={store}
                    theme={theme}
                    toggleDetail={
                        canOpenDetail(item) && DetailComponent
                            ? (callbacks?: {}) => state.toggleDetail(idx, callbacks)
                            : undefined
                    }
                />
                {DetailComponent ? (
                    <AnimatePresence mode="wait">
                        {state.displayedIdx !== undefined && idx === detailIdx ? (
                            <DetailWrapper
                                key={`detail-${state.displayedIdx}`}
                                byLine={state.byLine}
                                closeDetail={state.closeDetail}
                                DetailComponent={DetailComponent}
                                displayedIdx={state.displayedIdx}
                                isAddItemShown={isAddItemShown}
                                item={displayedData[state.displayedIdx]}
                                mode={state.mode}
                                mosaic={mosaic}
                                theme={theme}
                            />
                        ) : null}
                    </AnimatePresence>
                ) : null}
            </Fragment>
        ));

        return (
            <>
                {hasDragAndDrop ? <DndDragLayer i18nPrefix={i18nPrefix} theme={dragLayerTheme} /> : null}
                <div
                    className={theme.list({
                        mosaic: state.mode === "mosaic",
                        selected: (store && store.selectionStatus !== "none") ?? false
                    })}
                >
                    {/* Gestion de l'empty state. */}
                    {!isLoading && !hideAdditionalItems && !displayedData.length ? (
                        <EmptyComponent addItemHandler={state.addItemHandler} i18nPrefix={i18nPrefix} store={store} />
                    ) : (
                        <ul
                            ref={ul => {
                                state.ulRef = ul;
                            }}
                        >
                            {/* On regarde si on doit ajouter l'élément d'ajout. */}
                            {isAddItemShown ? (
                                <li
                                    key="mosaic-add"
                                    className={theme.mosaicAdd()}
                                    style={{width: mosaic.width, height: mosaic.height}}
                                >
                                    <AddItemComponent
                                        addItemHandler={state.addItemHandler}
                                        i18nPrefix={i18nPrefix}
                                        mode="mosaic"
                                    />
                                </li>
                            ) : null}
                            {lines}
                        </ul>
                    )}
                    {/* Gestion de l'affichage du chargement. */}
                    {isLoading ? <LoadingComponent i18nPrefix={i18nPrefix} store={store} /> : null}
                    {bottomRow}
                </div>
            </>
        );
    });
}

/**
 * `listFor` permet de poser le composant `List`, qui permet d'afficher des données sous forme d'une liste simple.
 *
 * Comme tous les composants de listes :
 * - Il peut s'utiliser soit directement avec une liste de données passée dans la prop `data`, soit avec un [`CollectionStore`](/docs/listes-store-de-collection--docs) passé dans la prop `store`.
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `isManualFetch`).
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
 * - Possibilité de définir les éléments de la liste comme des [sources de drag and drop](https://react-dnd.github.io/react-dnd/docs/api/use-drag) (via `hasDragAndDrop`)
 *
 * **Ce composant n'a d'intérêt que si vous avez besoin d'une des fonctionnalités listées dans cette description** (la plupart du temps, il s'agit de la pagination, de
 * la sélection, ou des actions de ligne). Sans ça, il n'a aucun avantage sur un simple `list.map()` React classique et apporte une complexité inutile.
 */
export function listFor<T>(props: ListProps<T>) {
    return <List<T> {...props} />;
}
