import * as PropTypes from "prop-types";
import * as React from "react";

import {themr} from "../../theme";

import * as styles from "./__style__/form.css";
export type FormStyle = Partial<typeof styles>;
const Theme = themr("form", styles);

/** Options additionnelles du Form. */
export interface FormProps {
    /** Voir `FormActions` */
    clean: () => void;
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

/** Composant de formulaire */
export class Form extends React.Component<FormProps> {
    static childContextTypes = {form: PropTypes.object};
    getChildContext() {
        return {form: this.props.formContext};
    }

    componentWillMount() {
        this.props.load();
    }

    componentWillUnmount() {
        this.props.clean();
    }

    render() {
        if (this.props.noForm) {
            return (
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
            );
        } else {
            return this.props.children;
        }
    }
}
