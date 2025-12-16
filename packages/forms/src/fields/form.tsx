import {ComponentType, createContext, useMemo} from "react";

import {ActionsFormProps} from "@focus4/stores";

/** Contexte de formulaire pour les champs. */
export const FormContext = createContext({
    errorDisplay: undefined as "after-focus" | "always" | "never" | undefined
});

declare global {
    /** Options additionnelles du Form. */
    interface FormProps extends Partial<ActionsFormProps> {}
}

let FormCore: ComponentType<FormProps> = () => null;

/** Enregistre le composant `Form`. */
export function registerFormComponent(FormComponent: ComponentType<FormProps>) {
    FormCore = FormComponent;
}

/** Composant de formulaire. */
export function Form(props: FormProps) {
    const context = useMemo(() => ({errorDisplay: props.errorDisplay}), [props.errorDisplay]);
    return (
        <FormContext value={context}>
            <FormCore {...props} />
        </FormContext>
    );
}
