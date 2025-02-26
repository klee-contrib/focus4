import {DomainFieldTypeSingle} from "@focus4/stores";
import {TextField, TextFieldProps} from "@focus4/toolbox";

import {useInput, UseInputProps} from "../utils";

export interface InputProps<T extends DomainFieldTypeSingle>
    extends Omit<TextFieldProps, "error" | "onChange" | "type" | "value">,
        UseInputProps<T> {
    /** Erreur à afficher sous le champ. */
    error?: string;
}

/**
 * Surcharge du [`TextField`](/docs/composants-focus4∕toolbox-textfield--docs) de `@focus4/toolbox` pour ajouter :
 *
 * -   La gestion de masques de saisie
 * -   Une gestion propre de saisie de nombre (avec formattage, restrictions de décimales, et un `onChange` qui renvoie bien un nombre)
 *
 * Il s'agit du composant par défaut de tous les domaines simples (`"boolean"`,`"number"` et `"string"`) pour [`fieldFor`](/docs/modèle-métier-afficher-des-champs--docs#fieldforfield-options) (`InputComponent`).
 */
export function Input<const T extends DomainFieldTypeSingle>({
    error,
    mask,
    noNegativeNumbers = false,
    hasThousandsSeparator = false,
    maxDecimals = 10,
    onChange,
    onKeyDown,
    onPaste,
    showSupportingText = "always",
    supportingText,
    type,
    value,
    ...props
}: InputProps<T>) {
    const {handleChange, handleKeyDown, handlePaste, stringValue} = useInput({
        hasThousandsSeparator,
        mask,
        maxDecimals,
        noNegativeNumbers,
        onChange,
        type,
        value
    });

    return (
        <TextField
            {...props}
            error={!!error}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            showSupportingText={showSupportingText}
            supportingText={error ?? supportingText}
            type="text"
            value={stringValue}
        />
    );
}
