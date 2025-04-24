import {takeWhile} from "es-toolkit";
import NumberParser from "intl-number-parser";
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
    onChange: (value?: DomainType<T>) => void;
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
            new Intl.NumberFormat(navigator.language, {
                useGrouping: hasThousandsSeparator,
                maximumFractionDigits: maxDecimals
            }),
        [hasThousandsSeparator, maxDecimals]
    );

    const parseNumber = useMemo(() => NumberParser(navigator.language, numberFormat.resolvedOptions()), [numberFormat]);

    const [numberStringValue, setNumberStringValue] = useState(
        type === "number" ? (value !== undefined ? numberFormat.format(value as number) : "") : undefined
    );
    useEffect(() => {
        if (type === "number" && (!numberStringValue || (value ?? undefined) !== parseNumber(numberStringValue))) {
            setNumberStringValue(value !== undefined ? numberFormat.format(value as number) : "");
        }
    }, [numberFormat, parseNumber, value]);

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

                if (navigator.language === "fr") {
                    v = v.replace(".", ",");
                }

                let isNegative = false;
                if (v.startsWith("-") && !noNegativeNumbers) {
                    v = v.substring(1);
                    isNegative = true;
                }

                const sample = numberFormat.formatToParts(1000.1);
                const decimal = sample.find(s => s.type === "decimal")!.value;
                const thousands = hasThousandsSeparator ? sample.find(s => s.type === "group")!.value : "";

                const invalidCharRegex = new RegExp(`[^\\d\\${thousands}\\${decimal}]`, "g");
                const digitDecimalRegex = new RegExp(`[\\d\\${decimal}-]`);
                const [left, right, nope] = v.split(decimal);

                if (
                    ((maxDecimals && (right || "").length <= maxDecimals) || right === undefined) &&
                    nope === undefined &&
                    !invalidCharRegex.exec(v)
                ) {
                    const newNumberValue = v ? (isNegative ? -1 : 1) * parseNumber(v) : NaN;
                    const newValue =
                        (isNegative ? "-" : "") + // Ajoute le "-" s'il faut.
                        (left
                            ? new Intl.NumberFormat(navigator.language, {
                                  minimumIntegerDigits: left.replaceAll(thousands, "").length,
                                  maximumFractionDigits: maxDecimals,
                                  useGrouping: hasThousandsSeparator
                              }).format(Math.abs(newNumberValue))
                            : "") +
                        (right !== undefined && !+right ? decimal : "") + // Ajoute la virgule si elle était là et a été retirée par le format().
                        (right ? takeWhile(right.split("").reverse(), c => c === "0").join("") : ""); // Ajoute les "0" de fin.

                    if (!newValue.includes("NaN")) {
                        newNumberStringValue = newValue;
                        setNumberStringValue(newValue);
                        onChange(!!newNumberValue || newNumberValue === 0 ? (newNumberValue as any) : undefined);
                    }
                }

                if (newNumberStringValue !== v) {
                    const end = getInputSelection(e.currentTarget).end - (isNegative ? 1 : 0);
                    const ajustedEnd =
                        Math.max(
                            0,
                            v.slice(0, end).replace(invalidCharRegex, "").replace(new RegExp(thousands, "g"), "")
                                .length +
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
            }
        },
        [noNegativeNumbers, numberFormat, numberStringValue, onChange, type]
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
