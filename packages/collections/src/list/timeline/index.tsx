import {useObserver} from "mobx-react";
import {ComponentType} from "react";
import {ZodType} from "zod";

import {FieldEntry} from "@focus4/entities";
import {CollectionStore, EntityField} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import {BottomRow, ListBaseProps, usePagination} from "../base";
import {AddItemProps, DefaultAddItemComponent, DefaultEmptyComponent, EmptyProps} from "../shared";

import {TimelineAddItem} from "./add";
import {TimelineLine} from "./line";

import timelineCss, {TimelineCss} from "../__style__/timeline.css";

export {timelineCss};
export type {TimelineCss};

/** Props du composant de TimeLine. */
export type TimelineProps<T extends object> = ListBaseProps<T> & {
    /** Composant personnalisé pour le bouton "Ajouter". */
    AddItemComponent?: ComponentType<AddItemProps<NoInfer<T>>>;
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Le sélecteur du champ contenant la date. */
    dateSelector: (data: NoInfer<T>) => EntityField<FieldEntry<Domain<ZodType<string>>>>;
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ComponentType<EmptyProps<NoInfer<T>>>;
    /** CSS. */
    theme?: CSSProp<TimelineCss>;
    /** Le composant de ligne. */
    TimelineComponent: ComponentType<{data: NoInfer<T>}>;
} & (
        | {
              /** Les données. */
              data: T[];
              /** Affiche un indicateur de chargement après le tableau. */
              isLoading?: boolean;
          }
        | {
              /** Store de liste ou de recherche. */
              store: CollectionStore<T>;
          }
    );

/**
 * Le composant `Timeline`, généralement posé par la fonction `timelineFor`, permet d'afficher des données sous forme d'une liste avec une timeline sur la gauche.
 *
 * Comme tous les composants de listes :
 * - Il peut s'utiliser soit directement avec une liste de données passée dans la prop `data`, soit avec un [`CollectionStore`](/docs/listes-store-de-collection--docs) passé dans la prop `store`.
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `paginationMode`).
 *
 * La timeline se définit avec :
 * - un `TimelineComponent` passé en props pour afficher les éléments de la liste, qui recevra dans sa prop `data` l'élément à afficher. La liste n'a aucune
 *   mise en forme pré-définie pour ses éléments en dehors de la timeline : l'ensemble du CSS nécessaire pour un affichage correct devra donc être porté par le
 *   `TimelineComponent`.
 * - un `dateSelector`, qui doit renvoyer le champ à utiliser pour la date dans la Timeline.
 *
 * Ce composant est très simple et assez limité dans ce qu'il peut faire. A n'utiliser que si son rendu vous intéresse et correspond exactement à votre besoin.
 */
export function Timeline<T extends object>({
    AddItemComponent = DefaultAddItemComponent,
    addItemHandler,
    baseTheme,
    // @ts-ignore
    data,
    dateSelector,
    EmptyComponent = DefaultEmptyComponent,
    i18nPrefix = "focus",
    // @ts-ignore
    isLoading,
    itemKey,
    paginationMode = "single-auto",
    perPage,
    sentinelItemIndex = 5,
    showAllHandler,
    // @ts-ignore
    store,
    TimelineComponent,
    theme: pTheme
}: TimelineProps<T>) {
    const theme = useTheme("timeline", timelineCss, pTheme);

    const {getDomRef, state, ...pagination} = usePagination<T>({
        data,
        isLoading,
        paginationMode,
        perPage,
        sentinelItemIndex,
        store
    });

    return useObserver(() =>
        !state.isLoading && !state.displayedData.length ? (
            <EmptyComponent addItemHandler={addItemHandler} i18nPrefix={i18nPrefix} store={store} />
        ) : (
            <ul className={theme.timeline()}>
                {addItemHandler ? (
                    <TimelineAddItem theme={theme}>
                        <AddItemComponent
                            addItemHandler={addItemHandler}
                            i18nPrefix={i18nPrefix}
                            mode="timeline"
                            store={store}
                        />
                    </TimelineAddItem>
                ) : null}
                {state.displayedData.map((item, idx) => (
                    <TimelineLine
                        key={itemKey(item, idx)}
                        data={item}
                        dateSelector={dateSelector}
                        domRef={getDomRef(idx)}
                        LineComponent={TimelineComponent}
                        theme={theme}
                    />
                ))}
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
            </ul>
        )
    );
}

/**
 * Le composant `Timeline`, généralement posé par la fonction `timelineFor`, permet d'afficher des données sous forme d'une liste avec une timeline sur la gauche.
 *
 * Comme tous les composants de listes :
 * - Il peut s'utiliser soit directement avec une liste de données passée dans la prop `data`, soit avec un [`CollectionStore`](/docs/listes-store-de-collection--docs) passé dans la prop `store`.
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `paginationMode`).
 *
 * La timeline se définit avec :
 * - un `TimelineComponent` passé en props pour afficher les éléments de la liste, qui recevra dans sa prop `data` l'élément à afficher. La liste n'a aucune
 *   mise en forme pré-définie pour ses éléments en dehors de la timeline : l'ensemble du CSS nécessaire pour un affichage correct devra donc être porté par le
 *   `TimelineComponent`.
 * - un `dateSelector`, qui doit renvoyer le champ à utiliser pour la date dans la Timeline.
 *
 * Ce composant est très simple et assez limité dans ce qu'il peut faire. A n'utiliser que si son rendu vous intéresse et correspond exactement à votre besoin.
 */
export function timelineFor<T extends object>(props: TimelineProps<T>) {
    return <Timeline {...props} />;
}
