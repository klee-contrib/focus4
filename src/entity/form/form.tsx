import * as React from "react";

import {themr} from "../../theme";

import * as styles from "./__style__/form.css";
export type FormStyle = Partial<typeof styles>;
const Theme = themr("form", styles);

/** Options additionnelles du Form. */
export interface FormProps {
    /** Voir `FormActions` */
    dispose: () => void;
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
export class Form extends React.Component<FormProps> {
    componentWillMount() {
        this.props.load();
    }

    componentWillUnmount() {
        this.props.dispose();
    }

    render() {
        return (
            <FormContext.Provider value={this.props.formContext}>
                {this.props.noForm ? (
                    <Theme theme={this.props.theme}>
                        {theme => (
                            <form
                                className={theme.form}
                                noValidate={true}
                                onSubmit={e => {
                                    e.preventDefault();
                                    this.props.save();
                                }}
                            >
                                <fieldset>{this.props.children}</fieldset>
                            </form>
                        )}
                    </Theme>
                ) : (
                    this.props.children
                )}
            </FormContext.Provider>
        );
    }
}
