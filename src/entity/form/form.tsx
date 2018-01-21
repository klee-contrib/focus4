import {autobind} from "core-decorators";
import * as PropTypes from "prop-types";
import * as React from "react";
import {themr} from "react-css-themr";

import * as styles from "./__style__/form.css";
export type FormStyle = Partial<typeof styles>;

/** Options additionnelles du Form. */
export interface FormProps {
    /** Voir `FormActions` */
    clean: () => void;
    /** Voir `FormActions` */
    formContext: {forceErrorDisplay: boolean};
    /** Par défaut: true */
    hasForm?: boolean;
    /** Voir `FormActions` */
    load: () => void;
    /** Voir `FormActions` */
    save: () => void;
    /** CSS. */
    theme?: FormStyle;
}

/** Composant de formulaire */
@autobind
export class Form extends React.Component<FormProps, void> {

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
        const {hasForm = true, theme} = this.props;
        if (hasForm) {
            return (
                <form
                    className={theme!.form!}
                    noValidate={true}
                    onSubmit={e => { e.preventDefault(); this.props.save(); }}
                >
                    <fieldset>{this.props.children}</fieldset>
                </form>
            );
        } else {
            return <div>{this.props.children}</div>;
        }
    }
}

export default themr("form", styles)(Form);
