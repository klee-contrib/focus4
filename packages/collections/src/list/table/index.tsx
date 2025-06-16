import {useObserver} from "mobx-react";
import {ComponentType, MouseEvent, useContext, useRef} from "react";

import {ScrollableContext, useStickyClip} from "@focus4/layout";
import {CollectionStore} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox} from "@focus4/toolbox";

import {ContextualActions, OperationListItem} from "../contextual-actions";
import {ListBaseProps, useListBase} from "../list-base";
import {DefaultLoadingComponent, LoadingProps} from "../shared";

import {TableColumn, TableHeader} from "./header";
import {TableLine} from "./line";

import tableCss, {TableCss} from "../__style__/table.css";

export {tableCss};
export type {TableColumn, TableCss};

/** Props du tableau de base. */
export type TableProps<T> = Omit<ListBaseProps<NoInfer<T>>, "isLoading"> & {
    /** La description des colonnes du tableau. */
    columns: TableColumn<NoInfer<T>>[];
    /** Classe CSS pour une ligne. */
    lineClassName?: (data: NoInfer<T>) => string;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: NoInfer<T>) => OperationListItem<NoInfer<T>>[];
    /** Composant à afficher pendant le chargement. */
    LoadingComponent?: ComponentType<LoadingProps<NoInfer<T>>>;
    /**
     * Surcharge du 'top' pour le 'position: sticky' du `<thead>`.
     * Par défaut calculé avec la hauteur du header.
     */
    offsetTopOverride?: number;
    /** Appelé au clic sur une ligne. */
    onLineClick?: (data: NoInfer<T>, event: MouseEvent<HTMLTableCellElement>) => void;
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
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `isManualFetch`).
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
export function Table<T>({
    columns,
    // @ts-ignore
    hasSelection,
    // @ts-ignore
    hasSelectAll,
    lineClassName,
    lineOperationList,
    LoadingComponent = DefaultLoadingComponent,
    offsetTopOverride,
    onLineClick,
    operationList,
    stickyHeader = false,
    theme: pTheme,
    ...baseProps
}: TableProps<T>) {
    const theme = useTheme("table", tableCss, pTheme);
    const {headerHeight} = useContext(ScrollableContext);

    const tbody = useRef<HTMLTableSectionElement>(null);
    useStickyClip(tbody);

    return useObserver(() => {
        const {bottomRow, displayedData, getDomRef, i18nPrefix, isLoading, itemKey, store} = useListBase(baseProps);
        return (
            <>
                <table
                    className={theme.table({
                        empty: displayedData.length === 0,
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
                                    store={store}
                                    theme={theme}
                                />
                            ))}
                            {!!lineOperationList || !!operationList ? (
                                <th className={theme.actions()}>
                                    {operationList ? (
                                        <ContextualActions
                                            data={store ? Array.from(store.selectedItems) : []}
                                            operationList={operationList}
                                        />
                                    ) : null}
                                </th>
                            ) : null}
                        </tr>
                    </thead>
                    <tbody ref={tbody}>
                        {displayedData.map((item, idx) => (
                            <TableLine
                                key={itemKey(item, idx)}
                                className={lineClassName}
                                columns={columns}
                                data={item}
                                domRef={getDomRef(idx)}
                                hasActions={!!lineOperationList || !!operationList}
                                hasSelection={hasSelection}
                                i18nPrefix={i18nPrefix}
                                onClick={onLineClick}
                                operationList={lineOperationList}
                                store={store}
                                theme={theme}
                            />
                        ))}
                    </tbody>
                </table>
                {/* Gestion de l'affichage du chargement. */}
                {isLoading ? <LoadingComponent i18nPrefix={i18nPrefix} store={store} /> : null}
                {bottomRow}
            </>
        );
    });
}

/**
 * `tableFor` permet de poser le composant `Table`, qui permet d'afficher des données sous forme d'un tableau simple.
 *
 * Comme tous les composants de listes :
 * - Il peut s'utiliser soit directement avec une liste de données passée dans la prop `data`, soit avec un [`CollectionStore`](/docs/listes-store-de-collection--docs) passé dans la prop `store`.
 * - Il peut gérer de la pagination (côté client avec `perPage` et/ou côté serveur avec le store), automatique ou manuelle (via `isManualFetch`).
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
export function tableFor<T>(props: TableProps<T>) {
    return <Table<T> {...props} />;
}
