import {useAsObservableSource} from "mobx-react-lite";
import * as React from "react";

import {useTheme} from "@focus4/styling";

import formStyles from "./__style__/form.css";
export {formStyles};
export type FormStyle = Partial<typeof formStyles>;

/** Options additionnelles du Form. */
export interface FormProps {
    /** Children. */
    children?: React.ReactNode;
    /** Force l'affichage des erreurs sur les champs. */
    forceErrorDisplay?: boolean;
    /** Retire le formulaire HTML */
    noForm?: boolean;
    /** Voir `FormActions` */
    save: () => void;
    /** CSS. */
    theme?: FormStyle;
}

export const FormContext = React.createContext({forceErrorDisplay: false});

/** Composant de formulaire */
export function Form({children, forceErrorDisplay = false, noForm, save, theme: pTheme}: FormProps) {
    const theme = useTheme("form", formStyles, pTheme);
    const context = useAsObservableSource({forceErrorDisplay});
    return (
        <FormContext.Provider value={context}>
            {noForm ? (
                <form
                    className={theme.form}
                    noValidate={true}
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
