import {useTranslation} from "react-i18next";

import {CollectionStore} from "@focus4/stores";
import {useTheme} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import listBaseCss from "./__style__/list-base.css";

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

/** Composant par défaut pour afficher le bouton d'ajout d'élément. */
export function DefaultAddItemComponent({addItemHandler, i18nPrefix = "focus", mode}: AddItemProps<any>) {
    const {t} = useTranslation();
    const theme = useTheme("listBase", listBaseCss);

    if (mode === "mosaic") {
        return (
            <Button
                icon={{i18nKey: `${i18nPrefix}.icons.list.add`}}
                label={t(`${i18nPrefix}.list.add`)}
                onClick={addItemHandler}
                theme={{
                    button: theme.mosaicAdd(),
                    icon: theme.mosaicAddIcon(),
                    label: theme.mosaicAddLabel()
                }}
                variant="elevated"
            />
        );
    } else {
        return (
            <Button
                color="primary"
                icon={{i18nKey: `${i18nPrefix}.icons.list.add`}}
                label={t(`${i18nPrefix}.list.add`)}
                onClick={addItemHandler}
                variant={mode === "search" ? "elevated-filled" : undefined}
            />
        );
    }
}

/** Composant d'empty state par défaut. */
export function DefaultEmptyComponent({i18nPrefix = "focus"}: EmptyProps<any>) {
    const {t} = useTranslation();
    const theme = useTheme("listBase", listBaseCss);

    return <div className={theme.empty()}>{t(`${i18nPrefix}.list.empty`)}</div>;
}
