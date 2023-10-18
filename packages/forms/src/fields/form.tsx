import {useLocalObservable} from "mobx-react";
import {createContext, ReactNode, useEffect} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import formCss, {FormCss} from "./__style__/form.css";
export {formCss, FormCss};

/** Options additionnelles du Form. */
export interface FormProps {
    /** Children. */
    children?: ReactNode;
    /** Désactive le style inline sur les champs qui spécifie la largeur du label et de la valeur.  */
    disableInlineSizing?: boolean;
    /** Force l'affichage des erreurs sur les champs. */
    forceErrorDisplay?: boolean;
    /** Modifie le labelRatio par défaut des champs posés dans le formulaire (33%); */
    labelRatio?: number;
    /** Retire le formulaire HTML */
    noForm?: boolean;
    /** Voir `FormActions` */
    save: () => void;
    /** CSS. */
    theme?: CSSProp<FormCss>;
    /** Modifie le valueRatio par défaut des champs posés dans le formulaire (33%); */
    valueRatio?: number;
}

export const FormContext = createContext({
    forceErrorDisplay: false,
    disableInlineSizing: false,
    labelRatio: undefined as number | undefined,
    valueRatio: undefined as number | undefined
});

/** Composant de formulaire */
export function Form({
    children,
    disableInlineSizing = false,
    forceErrorDisplay = false,
    labelRatio,
    noForm,
    save,
    theme: pTheme,
    valueRatio
}: FormProps) {
    const theme = useTheme("form", formCss, pTheme);
    const context = useLocalObservable(() => ({disableInlineSizing, forceErrorDisplay, labelRatio, valueRatio}));
    useEffect(() => {
        context.disableInlineSizing = disableInlineSizing;
        context.forceErrorDisplay = forceErrorDisplay;
        context.labelRatio = labelRatio;
        context.valueRatio = valueRatio;
    }, [forceErrorDisplay, labelRatio, valueRatio]);

    return (
        <FormContext.Provider value={context}>
            {!noForm ? (
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
