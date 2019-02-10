import * as React from "react";

import {themr} from "../../theme";

import * as styles from "./__style__/form.css";
export type FormStyle = Partial<typeof styles>;
const Theme = themr("form", styles);

/** Options additionnelles du Form. */
export interface FormProps {
    /** Children. */
    children?: React.ReactNode;
    /** Voir `FormActions` */
    formContext: {forceErrorDisplay: boolean};
    /** Retire le formulaire HTML */
    noForm?: boolean;
    /** Voir `FormActions` */
    load: () => void;
    /** Voir `FormActions` */
    save: () => void;
    /** CSS. */
    theme?: FormStyle;
}

export const FormContext = React.createContext({forceErrorDisplay: false});

/** Composant de formulaire */
export function Form(props: FormProps) {
    return (
        <FormContext.Provider value={props.formContext}>
            {props.noForm ? (
                <Theme theme={props.theme}>
                    {theme => (
                        <form
                            className={theme.form}
                            noValidate={true}
                            onSubmit={e => {
                                e.preventDefault();
                                props.save();
                            }}
                        >
                            <fieldset>{props.children}</fieldset>
                        </form>
                    )}
                </Theme>
            ) : (
                props.children
            )}
        </FormContext.Provider>
    );
}
