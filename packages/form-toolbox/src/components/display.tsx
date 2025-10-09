import {chunk} from "es-toolkit";
import {autorun} from "mobx";
import {useObserver} from "mobx-react";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {output, ZodType} from "zod";

import {ReferenceList, SingleZodType} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import displayCss, {DisplayCss} from "./__style__/display.css";

export {displayCss};
export type {DisplayCss};

/** Props du composant d'affichage. */
export interface DisplayProps<S extends ZodType> {
    /** Formatteur. */
    formatter?: (value: output<SingleZodType<S>> | undefined) => string;
    /** Service de résolution de code. */
    keyResolver?: (key: output<SingleZodType<S>>) => Promise<string | undefined>;
    /** Si renseigné pour un affichage multiple en mode `list`, découpe les listes en plusieurs morceaux pour pouvoir les afficher en colonnes par exemple. */
    listChunkSize?: number;
    /**
     * Permet de choisir si les valeurs multiples sont affichées en liste(s) ou sur une seule ligne.
     * Par défaut : `lists-if-multiple` (`inline` si une seule valeur et `lists` sinon).
     */
    multiValueDisplay?: "inline" | "lists-if-multiple" | "lists";
    /** Nom du champ. */
    name?: string;
    /** Schéma du champ (celui du domaine). */
    schema: S;
    /** CSS. */
    theme?: CSSProp<DisplayCss>;
    /** Valeur à afficher. */
    value?: output<S>;
    /** Liste des valeurs de référence. */
    values?: ReferenceList;
}

/**
 * Un `Display` permet d'afficher la valeur d'un champ.
 *
 * - Résout les listes de références (avec `values`).
 * - Résout les autocompletes (avec `keyResolver`).
 * - Résout les traductions i18n.
 * - Peut afficher des listes de valeurs.
 *
 * Il s'agit du composant d'affichage par défaut de tous les domaines (`DisplayComponent`).
 */
export function Display<S extends ZodType>({
    formatter = x => `${x}`,
    listChunkSize,
    keyResolver,
    multiValueDisplay = "lists-if-multiple",
    name,
    theme: pTheme,
    value,
    values
}: DisplayProps<S>) {
    const {t} = useTranslation();

    const theme = useTheme("display", displayCss, pTheme);

    const [label, setLabel] = useState<string[] | string>();
    useEffect(
        () =>
            autorun(() => {
                if (keyResolver) {
                    if (Array.isArray(value)) {
                        Promise.all(
                            value.map((v: output<SingleZodType<S>>) => keyResolver(v).then(res => res ?? `${v}`))
                        ).then(setLabel);
                    } else if (value) {
                        keyResolver(value as output<SingleZodType<S>>).then(res => setLabel(res ?? `${value}`));
                    } else {
                        setLabel(undefined);
                    }
                } else if (Array.isArray(value)) {
                    if (values) {
                        setLabel(
                            values
                                ?.filter(v => value.find((v2: output<SingleZodType<S>>) => v[values.$valueKey] === v2))
                                .map(v => formatter(v[values.$labelKey] ?? `${v[values.$valueKey]}`))
                        );
                    } else {
                        setLabel(value.map((v: output<SingleZodType<S>>) => formatter(v)));
                    }
                } else {
                    setLabel(formatter(values?.getLabel(value) ?? value));
                }
            }),
        [keyResolver, value, values]
    );

    return useObserver(() => (
        <div className={theme.display()} data-name={name}>
            {Array.isArray(label) ? (
                multiValueDisplay === "lists" || (multiValueDisplay === "lists-if-multiple" && label.length > 1) ? (
                    <div className={theme.lists()}>
                        {label.length > 0
                            ? chunk(label, listChunkSize ?? label.length).map((group, k) => (
                                  <ul key={k}>
                                      {group.map((v, i) => (
                                          <li key={i}>{t(v)}</li>
                                      ))}
                                  </ul>
                              ))
                            : null}
                    </div>
                ) : (
                    label.map(l => t(l)).join(", ")
                )
            ) : label ? (
                t(label)
            ) : null}
        </div>
    ));
}
