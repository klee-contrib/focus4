import {createContext, ReactNode, useMemo} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import formCss, {FormCss} from "./__style__/form.css";
export {formCss};
export type {FormCss};

/** Options additionnelles du Form. */
export interface FormProps {
    /** Children. */
    children?: ReactNode;
    /**
     * Contrôle l'affichage des erreurs dans les champs posés dans le `Form` :
     *
     * - `"never"` : Les erreurs ne sont jamais affichées.
     * - `"after-focus"` : Chaque champ affiche son erreur après avoir été focus au moins une fois.
     * - `"always"` : Les erreurs sont toujours affichées.
     *
     * Dans tous les cas, l'erreur n'est pas affichée dans un champ s'il a le focus.
     */
    errorDisplay?: "after-focus" | "always" | "never";
    /** Surcharge la valeur de la variable CSS `--field-label-width` dans le formulaire. */
    labelWidth?: string;
    /** Retire le formulaire HTML */
    noForm?: boolean;
    /** Voir `FormActions` */
    save?: () => void;
    /** CSS. */
    theme?: CSSProp<FormCss>;
    /** Surcharge la valeur de la variable CSS `--field-value-width` dans le formulaire. */
    valueWidth?: string;
}

export const FormContext = createContext({
    errorDisplay: undefined as "after-focus" | "always" | "never" | undefined
});

/** Composant de formulaire */
export function Form({children, errorDisplay, labelWidth, noForm, save, theme: pTheme, valueWidth}: FormProps) {
    const theme = useTheme("form", formCss, pTheme);
    const context = useMemo(() => ({errorDisplay}), [errorDisplay]);

    const style: Record<string, string> = {};
    if (labelWidth) {
        style["--field-label-width"] = labelWidth;
    }
    if (valueWidth) {
        style["--field-value-width"] = valueWidth;
    }

    return (
        <FormContext.Provider value={context}>
            {!noForm && save ? (
                <form
                    className={theme.form()}
                    noValidate
                    onSubmit={e => {
                        e.preventDefault();
                        save();
                    }}
                    style={style}
                >
                    {children}
                </form>
            ) : (
                <div style={style}>{children}</div>
            )}
        </FormContext.Provider>
    );
}
