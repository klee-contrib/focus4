import {ZodTypeSingle} from "@focus4/entities";
import {useInput, UseInputProps} from "@focus4/forms";
import {TextField, TextFieldProps} from "@focus4/toolbox";

export interface InputProps<S extends ZodTypeSingle>
    extends Omit<TextFieldProps, "error" | "label" | "onChange" | "type" | "value">,
        UseInputProps<S> {
    /** Erreur à afficher sous le champ. */
    error?: string;
}

/**
 * Surcharge du [`TextField`](/docs/composants-focus4∕toolbox-textfield--docs) de `@focus4/toolbox` pour ajouter :
 *
 * -   La gestion de masques de saisie
 * -   Une gestion propre de saisie de nombre (avec formattage, restrictions de décimales, et un `onChange` qui renvoie bien un nombre)
 *
 * Il s'agit du [composant par défaut de tous les domaines de type `string` ou `number`](/docs/docs/composants-composants-par-défaut--docs) pour [`fieldFor`](/docs/modèle-métier-afficher-des-champs--docs#fieldforfield-options) (`InputComponent`).
 */
export function Input<const S extends ZodTypeSingle>({
    error,
    mask,
    hasThousandsSeparator = false,
    noNegativeNumbers = false,
    maxDecimals = 10,
    onChange,
    onKeyDown,
    onPaste,
    schema,
    showSupportingText = "always",
    supportingText,
    value,
    ...props
}: InputProps<S>) {
    const {handleChange, handleKeyDown, handlePaste, stringValue} = useInput({
        hasThousandsSeparator,
        mask,
        maxDecimals,
        noNegativeNumbers,
        onChange,
        onKeyDown,
        onPaste,
        schema,
        value
    });

    return (
        <TextField
            {...props}
            error={!!error}
            label={undefined}
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
