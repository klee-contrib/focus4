import {range, takeWhile} from "lodash";
import numeral from "numeral";
import {ClipboardEventHandler, FormEvent, KeyboardEventHandler, useCallback, useEffect, useMemo, useState} from "react";

import {DomainFieldTypeSingle, DomainType} from "@focus4/stores";

import {MaskDefinition, useMask} from "./mask";
import {getInputSelection, setInputSelection} from "./selection";

export interface UseInputProps<T extends DomainFieldTypeSingle> {
    /** Pour un input de type "number", affiche les séparateurs de milliers. */
    hasThousandsSeparator?: boolean;
    /**
     * Pour un input de type "string", paramètre un masque de saisie.
     *
     * Le masque se renseigne dans `pattern`. Il doit définir au moins un caractère éditable, qui se représentent par défaut avec les caractères suivants :
     *
     * - `1` : nombre
     * - `a` : lettre
     * - `A` : lettre, forcée en majuscule à la saisie
     * - `*` : alphanumérique
     * - `#` : alphanumérique, forcé en majuscule à la saisie
     *
     * Si le masque doit inclure l'un de ses caractères dans sa partie statique, vous pouvez l'échapper avec un `\` (un `\` doit aussi être échappé).
     * Les caractères éditables sont personnalisables avec `formatCharacters` (pour en ajouter des nouveaux ou bien en supprimer, en passant `null` pour le caractère).
     *
     * Par défaut, le caratère qui sert de placeholder lorsqu'un caractère éditable n'est pas encore renseigné est `_`. Il est modifiable avec `placeholderChar`.
     *
     * Enfin, le masque peut être configuré pour s'afficher au fur et à mesure de la saisie avec `isRevealingMask`. Dans ce cas, aucun placeholder ne sera jamais affiché
     * (ce qui implique que si un caractère est effacé au milieu de la saisie, tous les caractères après le seront également).
     */
    mask?: MaskDefinition;
    /** Pour un input de type "number", le nombre maximal de décimales qu'il est possible de saisir. Par défaut : 10. */
    maxDecimals?: number;
    /** Pour un input de type "number", interdit la saisie de nombres négatifs. */
    noNegativeNumbers?: boolean;
    /** Handler appelé à chaque saisie. Retourne la valeur dans le type de l'input. */
    onChange: (value: DomainType<T> | undefined) => void;
    /** Au `keydown` du champ. */
    onKeyDown?: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    /** Au collage de texte dans le champ. */
    onPaste?: ClipboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    /** Type du champ (celui du domaine). */
    type: T;
    /** Valeur. */
    value?: DomainType<T>;
}

/**
 * Gère la saisie d'une valeur d'un type "number" (parsing, décimales...) ou "string" (avec masque) dans un champ texte.
 *
 * Utilisé par `Input`.
 */
export function useInput<const T extends DomainFieldTypeSingle>({
    noNegativeNumbers = false,
    hasThousandsSeparator = false,
    maxDecimals = 10,
    mask,
    onChange,
    onKeyDown,
    onPaste,
    type,
    value
}: UseInputProps<T>) {
    const numberFormat = useMemo(
        () =>
            `${hasThousandsSeparator ? "0," : ""}0${
                maxDecimals > 0
                    ? `[.][${range(0, maxDecimals)
                          .map(_ => "0")
                          .join("")}]`
                    : ""
            }`,
        [hasThousandsSeparator, maxDecimals]
    );

    const [numberStringValue, setNumberStringValue] = useState(
        type === "number" ? (value !== undefined ? numeral(value).format(numberFormat) : "") : undefined
    );
    useEffect(() => {
        if (
            type === "number" &&
            (!numberStringValue || (value ?? undefined) !== (numeral(numberStringValue).value() ?? undefined))
        ) {
            setNumberStringValue(value !== undefined ? numeral(value).format(numberFormat) : "");
        }
    }, [numberFormat, value]);

    const {handleKeyDown, handlePaste, stringValue} = useMask({
        onChange: onChange as (value: string) => void,
        value: value?.toString(),
        onKeyDown,
        onPaste,
        ...mask
    });

    const handleChange = useCallback(
        (v: string, e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (type !== "number") {
                onChange(v === "" ? undefined : (v as DomainType<T>));
            } else if (v === "") {
                setNumberStringValue("");
                onChange(undefined);
            } else {
                let newNumberStringValue = numberStringValue;

                if (numeral.locale() === "fr") {
                    v = v.replace(".", ",");
                }

                let isNegative = false;
                if (v.startsWith("-") && !noNegativeNumbers) {
                    v = v.substring(1);
                    isNegative = true;
                }

                const {decimal, thousands} = numeral.localeData().delimiters;
                const invalidCharRegex = new RegExp(`[^\\d\\${thousands}\\${decimal}]`, "g");
                const digitDecimalRegex = new RegExp(`[\\d\\${decimal}-]`);
                const [left, right, nope] = v.split(decimal);

                if (
                    ((maxDecimals && (right || "").length <= maxDecimals) || right === undefined) &&
                    nope === undefined &&
                    !invalidCharRegex.exec(v)
                ) {
                    const newValue =
                        (isNegative ? "-" : "") + // Ajoute le "-" s'il faut.
                        (!left && !right
                            ? ""
                            : // On formatte le nombre avec numeral en gardant tous les "0" de tête.
                              numeral(v).format(
                                  range(0, left.replace(new RegExp(thousands, "g"), "").length - 1)
                                      .map(_ => "0")
                                      .join("") + numberFormat
                              )) +
                        (right !== undefined && !+right ? decimal : "") + // Ajoute la virgule si elle était là et a été retirée par le format().
                        (right ? takeWhile(right.split("").reverse(), c => c === "0").join("") : ""); // Ajoute les "0" de fin.
                    const newNumberValue = numeral(newValue).value() ?? undefined;

                    if (!newValue.includes("NaN")) {
                        newNumberStringValue = newValue;
                        setNumberStringValue(newValue);
                        onChange(!!newNumberValue || newNumberValue === 0 ? (newNumberValue as any) : undefined);
                    }
                }

                const end = getInputSelection(e.currentTarget).end - (isNegative ? 1 : 0);
                const ajustedEnd =
                    Math.max(
                        0,
                        v.slice(0, end).replace(invalidCharRegex, "").replace(new RegExp(thousands, "g"), "").length +
                            newNumberStringValue!.split("").filter(c => c === "0").length -
                            v.split("").filter(c => c === "0").length
                    ) + (isNegative ? 1 : 0);

                let charCount = 0;
                const newEnd = newNumberStringValue!.split("").reduce((count, char) => {
                    if (charCount === ajustedEnd) {
                        return count;
                    }
                    if (digitDecimalRegex.exec(char)) {
                        charCount++;
                    }
                    return count + 1;
                }, 0);

                setInputSelection(e.currentTarget, {
                    start: newEnd,
                    end: newEnd
                });
            }
        },
        [maxDecimals, noNegativeNumbers, numberFormat, numberStringValue, onChange, type]
    );

    const finalValue = useMemo(() => {
        if (type === "string") {
            return stringValue;
        } else if (type === "number") {
            return numberStringValue!;
        } else {
            return value?.toString() ?? "";
        }
    }, [numberStringValue, stringValue, value]);

    return {handleChange, handleKeyDown, handlePaste, stringValue: finalValue};
}
