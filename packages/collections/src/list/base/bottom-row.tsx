import {useObserver} from "mobx-react";
import {useTranslation} from "react-i18next";

import {CollectionStore} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Button, CircularProgressIndicator, IconButton} from "@focus4/toolbox";

import {ListState} from "./list-state";

import listBaseCss, {ListBaseCss} from "../__style__/list-base.css";

export {listBaseCss};
export type {ListBaseCss};

/** Props du composant `BottomRow`. */
export interface BottomRowProps<T extends object> {
    /** Handler pour le bouton de première page. */
    handleFirst: () => void;
    /** Handler pour le bouton de dernière page.. */
    handleLast: () => void;
    /** Handler pour le bouton de page suivante. */
    handleNext: () => void;
    /** Handler pour le bouton de page précédente. */
    handlePrevious: () => void;
    /** Préfixe i18n pour les libellés de la liste. Par défaut : "focus". */
    i18nPrefix?: string;
    /**
     * Mode de pagination :
     * - `"single-auto"` (par défaut) : Le contenu de la page suivante s'affichera automatiquement à la suite de la page courante, une fois que l'élement sentinelle (déterminé par `sentinelItemIndex`) sera visible à l'écran.
     * - `"single-manual"` : Le contenu de la page suivante s'affichera à la suite de la page courante, via un bouton "Voir plus" dédié.
     * - `"multiple"` : Le contenu de la page suivante remplacera le contenu de la page courante. La navigation entre les pages se fera via des boutons de navigation dédiés.
     */
    paginationMode?: "multiple" | "single-auto" | "single-manual";
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage?: number;
    /** Affiche un bouton "Voir tout" qui effectue cette action. */
    showAllHandler?: () => void;
    /** L'état de liste, retourné par `useListState`. */
    state: ListState<T>;
    /** Le store contenant la liste. */
    store?: CollectionStore<T>;
    /** CSS */
    theme?: CSSProp<ListBaseCss>;
}

/** Composant pour afficher les boutons de pagination sur les composants de liste. */
export function BottomRow<T extends object>({
    handleFirst,
    handleLast,
    handleNext,
    handlePrevious,
    i18nPrefix = "focus",
    paginationMode = "single-auto",
    showAllHandler,
    state,
    store,
    theme: pTheme
}: BottomRowProps<T>) {
    const {t} = useTranslation();

    return useObserver(() => {
        const theme = useTheme("listBase", listBaseCss, pTheme);
        return (
            <div className={theme.bottomRow()}>
                {state.isLoading && (!state.displayedData.length || paginationMode === "single-auto") ? (
                    <CircularProgressIndicator className={theme.loading()} indeterminate />
                ) : null}
                {paginationMode === "single-manual" && (state.hasMoreAfter || state.hasMoreToLoad) ? (
                    <Button
                        color={state.isLoading ? "primary" : undefined}
                        disabled={state.isLoading}
                        icon={{i18nKey: `${i18nPrefix}.icons.list.add`}}
                        label={t(`${i18nPrefix}.list.show.more`, {
                            displayed: state.displayedData.length,
                            total: store?.totalCount ?? state.data.length
                        })}
                        loading={state.isLoading}
                        onClick={handleNext}
                    />
                ) : paginationMode === "multiple" ? (
                    <div className={theme.navigation()}>
                        <IconButton
                            disabled={!state.hasMoreBefore || state.isLoading}
                            icon={{i18nKey: `${i18nPrefix}.icons.list.first`}}
                            onClick={handleFirst}
                        />
                        <IconButton
                            disabled={!state.hasMoreBefore || state.isLoading}
                            icon={{i18nKey: `${i18nPrefix}.icons.list.previous`}}
                            onClick={handlePrevious}
                        />
                        <span className={theme.items()}>
                            {t(`${i18nPrefix}.list.pagination`, {
                                start: state.displayedStart + 1,
                                end: Math.min(state.displayedEnd ?? Infinity, state.data.length),
                                total: store?.totalCount ?? state.data.length
                            })}
                        </span>
                        <IconButton
                            color={state.isLoading ? "primary" : undefined}
                            disabled={(!state.hasMoreAfter && !state.hasMoreToLoad) || state.isLoading}
                            icon={{i18nKey: `${i18nPrefix}.icons.list.next`}}
                            loading={state.isLoading}
                            onClick={handleNext}
                        />
                        {store?.type !== "server" ? (
                            <IconButton
                                disabled={!state.hasMoreAfter}
                                icon={{i18nKey: `${i18nPrefix}.icons.list.last`}}
                                onClick={handleLast}
                            />
                        ) : null}
                    </div>
                ) : null}
                {showAllHandler ? (
                    <Button
                        icon={{i18nKey: `${i18nPrefix}.icons.list.showAll`}}
                        label={t(`${i18nPrefix}.list.show.all`)}
                        onClick={showAllHandler}
                    />
                ) : null}
            </div>
        );
    });
}
