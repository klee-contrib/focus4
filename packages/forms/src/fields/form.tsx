import {useLocalObservable} from "mobx-react";
import {createContext, ReactNode, useEffect} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import formCss, {FormCss} from "./__style__/form.css";
export {formCss, FormCss};

/** Options additionnelles du Form. */
export interface FormProps {
    /** Children. */
    children?: ReactNode;
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
    labelRatio: undefined as number | undefined,
    valueRatio: undefined as number | undefined
});

/** Composant de formulaire */
export function Form({
    children,
    forceErrorDisplay = false,
    labelRatio,
    noForm,
    save,
    theme: pTheme,
    valueRatio
}: FormProps) {
    const theme = useTheme("form", formCss, pTheme);
    const context = useLocalObservable(() => ({forceErrorDisplay, labelRatio, valueRatio}));
    useEffect(() => {
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
                    <fieldset>{children}</fieldset>
                </form>
            ) : (
                children
            )}
        </FormContext.Provider>
    );
}
