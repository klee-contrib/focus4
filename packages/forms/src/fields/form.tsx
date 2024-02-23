import {createContext, ReactNode, useMemo} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import formCss, {FormCss} from "./__style__/form.css";
export {formCss, FormCss};

/** Options additionnelles du Form. */
export interface FormProps {
    /** Children. */
    children?: ReactNode;
    /** Désactive le style inline sur les champs qui spécifie la largeur du label et de la valeur.  */
    disableInlineSizing?: boolean;
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
    /** Modifie le labelRatio par défaut des champs posés dans le formulaire (33%); */
    labelRatio?: number;
    /** Retire le formulaire HTML */
    noForm?: boolean;
    /** Voir `FormActions` */
    save?: () => void;
    /** CSS. */
    theme?: CSSProp<FormCss>;
    /** Modifie le valueRatio par défaut des champs posés dans le formulaire (33%); */
    valueRatio?: number;
}

export const FormContext = createContext({
    errorDisplay: undefined as FormProps["errorDisplay"],
    disableInlineSizing: false,
    labelRatio: undefined as number | undefined,
    valueRatio: undefined as number | undefined
});

/** Composant de formulaire */
export function Form({
    children,
    disableInlineSizing = false,
    errorDisplay,
    labelRatio,
    noForm,
    save,
    theme: pTheme,
    valueRatio
}: FormProps) {
    const theme = useTheme("form", formCss, pTheme);
    const context = useMemo(
        () => ({
            disableInlineSizing,
            errorDisplay,
            labelRatio,
            valueRatio
        }),
        [disableInlineSizing, errorDisplay, labelRatio, valueRatio]
    );
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
                >
                    {children}
                </form>
            ) : (
                children
            )}
        </FormContext.Provider>
    );
}
