import {ReactNode} from "react";

import {CSSProp, useTheme} from "@focus4/styling";

import formCss, {FormCss} from "./__style__/form.css";

export {formCss};
export type {FormCss};

declare global {
    interface FormProps {
        /** Children. */
        children?: ReactNode;
        /** Surcharge la valeur de la variable CSS `--field-label-width` dans le formulaire. */
        labelWidth?: string;
        /** Retire le formulaire HTML */
        noForm?: boolean;
        /** CSS. */
        theme?: CSSProp<FormCss>;
        /** Surcharge la valeur de la variable CSS `--field-value-width` dans le formulaire. */
        valueWidth?: string;
    }
}

/** Composant de formulaire */
export function FormCore({children, labelWidth, noForm, save, theme: pTheme, valueWidth}: FormProps) {
    const theme = useTheme("form", formCss, pTheme);

    const style: Record<string, string> = {};
    if (labelWidth) {
        style["--field-label-width"] = labelWidth;
    }
    if (valueWidth) {
        style["--field-value-width"] = valueWidth;
    }

    return !noForm && save ? (
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
    );
}
