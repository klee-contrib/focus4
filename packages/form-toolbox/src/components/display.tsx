import {chunk} from "es-toolkit";
import {useObserver} from "mobx-react";
import {ZodType} from "zod";

import {useDisplay, UseDisplayProps} from "@focus4/forms";
import {CSSProp, useTheme} from "@focus4/styling";

import displayCss, {DisplayCss} from "./__style__/display.css";

export {displayCss};
export type {DisplayCss};

/** Props du composant d'affichage. */
export interface DisplayProps<S extends ZodType> extends UseDisplayProps<S> {
    /** Si renseigné pour un affichage multiple en mode `list`, découpe les listes en plusieurs morceaux pour pouvoir les afficher en colonnes par exemple. */
    listChunkSize?: number;
    /**
     * Permet de choisir si les valeurs multiples sont affichées en liste(s) ou sur une seule ligne.
     * Par défaut : `lists-if-multiple` (`inline` si une seule valeur et `lists` sinon).
     */
    multiValueDisplay?: "inline" | "lists-if-multiple" | "lists";
    /** Nom du champ. */
    name?: string;
    /** CSS. */
    theme?: CSSProp<DisplayCss>;
}

/**
 * Un `Display` permet d'afficher la valeur d'un champ.
 *
 * - Résout les listes de références (avec `values`).
 * - Résout les autocompletes (avec `keyResolver`).
 * - Résout les traductions i18n.
 * - Peut afficher des listes de valeurs.
 *
 * Il s'agit du [composant d'affichage par défaut de tous les domaines](/docs/docs/composants-composants-par-défaut--docs)  (`DisplayComponent`).
 */
export function Display<S extends ZodType>({
    listChunkSize,
    multiValueDisplay = "lists-if-multiple",
    name,
    theme: pTheme,
    ...props
}: DisplayProps<S>) {
    const theme = useTheme("display", displayCss, pTheme);

    const label = useDisplay(props);

    return useObserver(() => (
        <div className={theme.display()} data-name={name}>
            {Array.isArray(label) ? (
                multiValueDisplay === "lists" || (multiValueDisplay === "lists-if-multiple" && label.length > 1) ? (
                    <div className={theme.lists()}>
                        {label.length > 0
                            ? chunk(label, listChunkSize ?? label.length).map((group, k) => (
                                  <ul key={k}>
                                      {group.map((v, i) => (
                                          <li key={i}>{v}</li>
                                      ))}
                                  </ul>
                              ))
                            : null}
                    </div>
                ) : (
                    label.join(", ")
                )
            ) : (
                label
            )}
        </div>
    ));
}
