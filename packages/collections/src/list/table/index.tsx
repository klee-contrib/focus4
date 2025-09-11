import {useObserver} from "mobx-react";
import {KeyboardEvent, MouseEvent, useContext, useRef} from "react";

import {ScrollableContext, useStickyClip} from "@focus4/layout";
import {CollectionStore} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox} from "@focus4/toolbox";

import {BottomRow, ListBaseProps, usePagination} from "../base";
import {ContextualActions, OperationListItem} from "../contextual-actions";

import {TableColumn, TableHeader} from "./header";
import {TableLine} from "./line";

import tableCss, {TableCss} from "../__style__/table.css";

export {tableCss};
export type {TableColumn, TableCss};

/** Props du tableau de base. */
export type TableProps<T extends object> = ListBaseProps<T> & {
    /** La description des colonnes du tableau. */
    columns: TableColumn<NoInfer<T>>[];
    /** Classe CSS pour une ligne. */
    lineClassName?: (data: NoInfer<T>) => string;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: NoInfer<T>) => OperationListItem<NoInfer<T>>[];
    /** Nombre de colonnes maximum sur lequelles il est possible de trier en même temps. Par défaut : 1. */
    maxSort?: number;
    /**
     * Surcharge du 'top' pour le 'position: sticky' du `<thead>`.
     * Par défaut calculé avec la hauteur du header.
     */
    offsetTopOverride?: number;
    /** Appelé au clic sur une ligne. */
    onLineClick?: (
        data: NoInfer<T>,
        event: MouseEvent<HTMLTableCellElement> | KeyboardEvent<HTMLTableRowElement>
    ) => void;
    /** Actions globales sur le tableau, affichées dans le header. */
    operationList?: OperationListItem<NoInfer<T>[]>[];
    /** Rend le `<thead>` sticky. Attention au rendu avec `box-shadow` sur le tableau (qui est présent par défaut). */
    stickyHeader?: boolean;
    /** CSS. */
    theme?: CSSProp<TableCss>;
} & (
        | {
              /** Active la sélection sur le tableau. */
              hasSelection?: boolean;
              /** Si la sélection est activée, affiche également un bouton pour sélectionner tous les éléments dans le header. */
              hasSelectAll?: boolean;
              /** Le store contenant la liste. */
              store: CollectionStore<T>;
          }
        | {
              /** Les données du tableau. */
              data: T[];
              /** Affiche un indicateur de chargement après le tableau. */
              isLoading?: boolean;
          }
    );

/**
 * Le composant `Table`, généralement posé par la fonction `tableFor`, permet d'afficher des données sous forme d'un tableau simple.
 *
 * Comme tous les composants de listes :
 * - Il peut s'utiliser soit directement avec une liste de données passée dans la prop `data`, soit avec un [`CollectionStore`](/docs/listes-store-de-collection--docs) passé dans la prop `store`.
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `paginationMode`).
 *
 * Le tableau se base sur des définitions de colonnes (`columns`) qui doivent définir un titre et un contenu, ce dernier étant défini comme une fonction des
 * données qui retourne un rendu JSX. Le CSS de chaque ligne et de chaque colonne peut être personnalisé via `lineClassName` et `column.className`.
 *
 * Il est possible de définir des actions pour chaque ligne du tableau (via `lineOperationList`), ainsi que des actions globales qui se positionneront dans le header
 * via `operationList`.
 *
 * Lorsqu'il est interfacé avec un [`CollectionStore`](/docs/listes-store-de-collection--docs), le tableau peut aussi :
 * - Gérer du tri par colonne, en renseignant `sortKey` dans une définition de colonne (le tri peut être configuré sur plusieurs colonnes en même temps avec la prop `maxSort`).
 * - Gérer de la sélection d'éléments, en renseignant `hasSelection`.
 * - Gérer la sélection en masse avec `hasSelectAll`, qui ajoute une `Checkbox` dans le header pour tout sélectionner. Son comportement est similaire à
 *   celui de l'`ActionBar`. Si renseigné, les actions globales définies dans `operationList` s'appliqueront sur les éléments sélectionnés.
 *
 * Ce composant devrait couvrir la plupart des cas d'usage basiques pour un tableau. S'il ne répond pas à vos besoins (par exemple si vous avez besoin d'avoir une
 * mise en forme personnalisée), vous pouvez toujours revenir à un tableau HTML à la main... Vous pouvez cependant réutiliser la logique de pagination avec le
 * hook `useListBase` et le CSS du tableau en utilisant `tableCss`.
 */
export function Table<T extends object>({
    baseTheme,
    columns,
    // @ts-ignore
    data,
    // @ts-ignore
    hasSelection,
    // @ts-ignore
    hasSelectAll,
    i18nPrefix = "focus",
    // @ts-ignore
    isLoading,
    itemKey,
    lineClassName,
    lineOperationList,
    maxSort = 1,
    offsetTopOverride,
    onLineClick,
    operationList,
    paginationMode = "single-auto",
    perPage,
    sentinelItemIndex = 5,
    showAllHandler,
    stickyHeader = false,
    // @ts-ignore
    store,
    theme: pTheme
}: TableProps<T>) {
    const theme = useTheme("table", tableCss, pTheme);
    const {headerHeight} = useContext(ScrollableContext);

    const tbody = useRef<HTMLTableSectionElement>(null);
    useStickyClip(tbody);

    const {getDomRef, state, ...pagination} = usePagination<T>({
        data,
        isLoading,
        paginationMode,
        perPage,
        sentinelItemIndex,
        store
    });

    return useObserver(() => (
        <>
            <table
                className={theme.table({
                    empty: state.displayedData.length === 0,
                    selected: (store && store.selectionStatus !== "none") ?? false,
                    sticky: stickyHeader
                })}
            >
                <thead
                    style={
                        stickyHeader
                            ? {top: `calc(${offsetTopOverride ?? headerHeight}px + var(--content-padding-top))`}
                            : undefined
                    }
                >
                    <tr className={theme.header()}>
                        {hasSelection ? (
                            <th className={theme.checkbox({all: hasSelectAll})}>
                                {hasSelectAll && store ? (
                                    <Checkbox
                                        indeterminate={store.selectionStatus === "partial"}
                                        onChange={store.toggleAll}
                                        value={store.selectionStatus !== "none"}
                                    />
                                ) : null}
                            </th>
                        ) : null}
                        {columns.map(column => (
                            <TableHeader
                                key={column.title}
                                column={column}
                                i18nPrefix={i18nPrefix}
                                maxSort={maxSort}
                                store={store}
                                theme={theme}
                            />
                        ))}
                        {!!lineOperationList || !!operationList ? (
                            <th className={theme.actions()}>
                                {operationList ? (
                                    <ContextualActions
                                        data={store ? [...store.selectedItems] : []}
                                        operationList={operationList}
                                    />
                                ) : null}
                            </th>
                        ) : null}
                    </tr>
                </thead>
                <tbody ref={tbody}>
                    {state.displayedData.map((item, idx) => (
                        <TableLine
                            key={itemKey(item, idx)}
                            className={lineClassName}
                            columns={columns}
                            data={item}
                            domRef={getDomRef(idx)}
                            hasActions={!!lineOperationList || !!operationList}
                            hasSelection={hasSelection}
                            onClick={onLineClick}
                            operationList={lineOperationList}
                            store={store}
                            theme={theme}
                        />
                    ))}
                </tbody>
            </table>
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
        </>
    ));
}

/**
 * `tableFor` permet de poser le composant `Table`, qui permet d'afficher des données sous forme d'un tableau simple.
 *
 * Comme tous les composants de listes :
 * - Il peut s'utiliser soit directement avec une liste de données passée dans la prop `data`, soit avec un [`CollectionStore`](/docs/listes-store-de-collection--docs) passé dans la prop `store`.
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `paginationMode`).
 *
 * Le tableau se base sur des définitions de colonnes (`columns`) qui doivent définir un titre et un contenu, ce dernier étant défini comme une fonction des
 * données qui retourne un rendu JSX. Le CSS de chaque ligne et de chaque colonne peut être personnalisé via `lineClassName` et `column.className`.
 *
 * Il est possible de définir des actions pour chaque ligne du tableau (via `lineOperationList`), ainsi que des actions globales qui se positionneront dans le header
 * via `operationList`.
 *
 * Lorsqu'il est interfacé avec un [`CollectionStore`](/docs/listes-store-de-collection--docs), le tableau peut aussi :
 * - Gérer du tri par colonne, en renseignant `sortKey` dans une définition de colonne.
 * - Gérer de la sélection d'éléments, en renseignant `hasSelection`.
 * - Gérer la sélection en masse avec `hasSelectAll`, qui ajoute une `Checkbox` dans le header pour tout sélectionner. Son comportement est similaire à
 *   celui de l'`ActionBar`. Si renseigné, les actions globales définies dans `operationList` s'appliqueront sur les éléments sélectionnés.
 *
 * Ce composant devrait couvrir la plupart des cas d'usage basiques pour un tableau. S'il ne répond pas à vos besoins (par exemple si vous avez besoin d'avoir une
 * mise en forme personnalisée), vous pouvez toujours revenir à un tableau HTML à la main... Vous pouvez cependant réutiliser la logique de pagination avec le
 * hook `useListBase` et le CSS du tableau en utilisant `tableCss`.
 */
export function tableFor<T extends object>(props: TableProps<T>) {
    return <Table<T> {...props} />;
}
