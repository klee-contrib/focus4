import i18next from "i18next";
import * as React from "react";

import {CollectionStore} from "@focus4/stores";
import {getIcon, useTheme} from "@focus4/styling";
import {Button, FontIcon} from "@focus4/toolbox";

import listBaseCss from "./__style__/list-base.css";

/** Props de base d'un composant d'ajout d'item. */
export interface AddItemProps<T> {
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler: () => void;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Mode de la liste. */
    mode: "mosaic" | "search" | "timeline";
    /** Store de la liste. */
    store?: CollectionStore<T>;
}

/** Props de base d'un composant d'empty state. */
export interface EmptyProps<T> {
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Store de la liste. */
    store?: CollectionStore<T>;
}

/** Props de base d'un composant de chargement. */
export interface LoadingProps<T> {
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Store de la liste. */
    store?: CollectionStore<T>;
}

/** Composant par défaut pour afficher le bouton d'ajout d'élément. */
export function DefaultAddItemComponent({addItemHandler, i18nPrefix, mode}: AddItemProps<any>) {
    const theme = useTheme("listBase", listBaseCss);
    if (mode === "mosaic") {
        return (
            <div className={theme.add()} onClick={addItemHandler}>
                <FontIcon>{getIcon(`${i18nPrefix}.icons.list.add`)}</FontIcon>
                {i18next.t(`${i18nPrefix}.list.add`)}
            </div>
        );
    } else {
        return (
            <Button
                onClick={addItemHandler}
                icon={getIcon(`${i18nPrefix}.icons.list.add`)}
                label={i18next.t(`${i18nPrefix}.list.add`)}
                primary
                raised={mode === "search"}
            />
        );
    }
}

/** Composant d'empty state par défaut. */
export function DefaultEmptyComponent({i18nPrefix}: EmptyProps<any>) {
    const theme = useTheme("listBase", listBaseCss);
    return <div className={theme.loading()}>{i18next.t(`${i18nPrefix}.list.empty`)}</div>;
}

/** Composant de chargement par défaut. */
export function DefaultLoadingComponent({i18nPrefix}: LoadingProps<any>) {
    const theme = useTheme("listBase", listBaseCss);
    return <div className={theme.loading()}>{i18next.t(`${i18nPrefix}.search.loading`)}</div>;
}
