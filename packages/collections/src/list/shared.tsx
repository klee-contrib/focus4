import i18next from "i18next";

import {CollectionStore} from "@focus4/stores";
import {useTheme} from "@focus4/styling";
import {Button, FontIcon} from "@focus4/toolbox";

import listBaseCss from "./__style__/list-base.css";

/** Props de base d'un composant d'ajout d'item. */
export interface AddItemProps<T extends object> {
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
export interface EmptyProps<T extends object> {
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Store de la liste. */
    store?: CollectionStore<T>;
}

/** Props de base d'un composant de chargement. */
export interface LoadingProps<T extends object> {
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Store de la liste. */
    store?: CollectionStore<T>;
}

/** Composant par défaut pour afficher le bouton d'ajout d'élément. */
export function DefaultAddItemComponent({addItemHandler, i18nPrefix = "focus", mode}: AddItemProps<any>) {
    const theme = useTheme("listBase", listBaseCss);
    if (mode === "mosaic") {
        return (
            <div className={theme.add()} onClick={addItemHandler}>
                <FontIcon icon={{i18nKey: `${i18nPrefix}.icons.list.add`}} />
                {i18next.t(`${i18nPrefix}.list.add`)}
            </div>
        );
    } else {
        return (
            <Button
                color="primary"
                icon={{i18nKey: `${i18nPrefix}.icons.list.add`}}
                label={i18next.t(`${i18nPrefix}.list.add`)}
                onClick={addItemHandler}
                variant={mode === "search" ? "elevated-filled" : undefined}
            />
        );
    }
}

/** Composant d'empty state par défaut. */
export function DefaultEmptyComponent({i18nPrefix = "focus"}: EmptyProps<any>) {
    const theme = useTheme("listBase", listBaseCss);
    return <div className={theme.loading()}>{i18next.t(`${i18nPrefix}.list.empty`)}</div>;
}

/** Composant de chargement par défaut. */
export function DefaultLoadingComponent({i18nPrefix = "focus"}: LoadingProps<any>) {
    const theme = useTheme("listBase", listBaseCss);
    return <div className={theme.loading()}>{i18next.t(`${i18nPrefix}.search.loading`)}</div>;
}
