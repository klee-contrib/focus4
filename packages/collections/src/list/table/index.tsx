import {useObserver} from "mobx-react";
import {ComponentType} from "react";

import {CollectionStore} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Checkbox} from "@focus4/toolbox";

import {ContextualActions, OperationListItem} from "../contextual-actions";
import {ListBaseProps, useListBase} from "../list-base";
import {DefaultLoadingComponent, LoadingProps} from "../shared";

import {TableColumn, TableHeader} from "./header";
import {TableLine} from "./line";

import tableCss, {TableCss} from "../__style__/table.css";

export {TableColumn, tableCss, TableCss};

/** Props du tableau de base. */
export type TableProps<T> = Omit<ListBaseProps<T>, "isLoading"> & {
    /** La description des colonnes du tableau. */
    columns: TableColumn<T>[];
    /** Classe CSS pour une ligne. */
    lineClassName?: (data: T) => string;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: T) => OperationListItem<T>[];
    /** Composant à afficher pendant le chargement. */
    LoadingComponent?: ComponentType<LoadingProps<T>>;
    /** Appelé au clic sur une ligne. */
    onLineClick?: (data: T) => void;
    /** Actions globales sur le tableau, affichées dans le header. */
    operationList?: OperationListItem<T[]>[];
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
    onLineClick,
    operationList,
    theme: pTheme,
    ...baseProps
}: TableProps<T>) {
    const theme = useTheme("table", tableCss, pTheme);

    return useObserver(() => {
        const {bottomRow, displayedData, getDomRef, i18nPrefix, isLoading, itemKey, store} = useListBase(baseProps);
        return (
            <>
                <table className={theme.table({selected: (store && store.selectionStatus !== "none") ?? false})}>
                    <thead>
                        <tr className={theme.header()}>
                            {hasSelection ? (
                                <th className={hasSelectAll ? theme.checkbox() : undefined}>
                                    {hasSelectAll ? (
                                        <Checkbox
                                            indeterminate={store?.selectionStatus === "partial"}
                                            onChange={store?.toggleAll}
                                            value={store?.selectionStatus !== "none"}
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
                                <th
                                    className={theme.actions({
                                        hidden: hasSelectAll && store?.selectionStatus === "none"
                                    })}
                                >
                                    {operationList ? (
                                        <ContextualActions
                                            data={store ? Array.from(store.selectedItems) : displayedData}
                                            operationList={operationList}
                                        />
                                    ) : null}
                                </th>
                            ) : null}
                        </tr>
                    </thead>
                    <tbody>
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
