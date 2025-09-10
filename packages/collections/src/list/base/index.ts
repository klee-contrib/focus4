import {CSSProp} from "@focus4/styling";

import {ListBaseCss} from "./bottom-row";

export {BottomRow, listBaseCss} from "./bottom-row";
export {useListState} from "./list-state";
export {usePagination} from "./pagination";

export type {BottomRowProps, ListBaseCss} from "./bottom-row";
export type {ListState, UseListStateArgs} from "./list-state";
export type {UsePaginationArgs} from "./pagination";

/** Props communes à tous les composants de liste. */
export interface ListBaseProps<T extends object> {
    /** CSS pour la `BottomRow`. */
    baseTheme?: CSSProp<ListBaseCss>;
    /** Préfixe i18n pour les libellés de la liste. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Fonction pour déterminer la key à utiliser pour chaque élément de la liste. */
    itemKey: (item: T, idx: number) => number | string | undefined;
    /**
     * Mode de pagination :
     * - `"single-auto"` (par défaut) : Le contenu de la page suivante s'affichera automatiquement à la suite de la page courante, une fois que l'élement sentinelle (déterminé par `sentinelItemIndex`) sera visible à l'écran.
     * - `"single-manual"` : Le contenu de la page suivante s'affichera à la suite de la page courante, via un bouton "Voir plus" dédié.
     * - `"multiple"` : Le contenu de la page suivante remplacera le contenu de la page courante. La navigation entre les pages se fera via des boutons de navigation dédiés.
     */
    paginationMode?: "multiple" | "single-auto" | "single-manual";
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage?: number;
    /**
     * Index de l'item en partant du bas de page courante qui chargera, dès qu'il sera visible à l'écran, la page suivante (en pagination `"single-auto"`).
     *
     * Par défaut : 5.
     */
    sentinelItemIndex?: number;
    /** Affiche un bouton "Voir tout" qui effectue cette action. */
    showAllHandler?: () => void;
}
