import classNames from "classnames";
import {useObserver} from "mobx-react";

import {FieldEntry} from "@focus4/entities";
import {useField, UseFieldProps} from "@focus4/forms";
import {CSSProp, useTheme} from "@focus4/styling";

import fieldCss, {FieldCss} from "./__style__/field.css";

export {fieldCss};
export type {FieldCss};

declare global {
    interface FieldOptions<F extends FieldEntry> {
        /** Surcharge la valeur de la variable CSS `--field-label-width` pour ce champ. */
        labelWidth?: string;
        /** CSS. */
        theme?: CSSProp<FieldCss>;
        /** Surcharge la valeur de la variable CSS `--field-value-width` pour ce champ. */
        valueWidth?: string;
    }
}

/** Props pour le composant `Field`. */
export interface FieldProps<F extends FieldEntry> extends UseFieldProps<F>, FieldOptions<F> {}

/** Composant pour poser un champ, utilisé par `fieldFor` et consorts. */
export function Field<F extends FieldEntry>(props: FieldProps<F>) {
    return useObserver(() => {
        const fieldProps = props.field.$field.domain.fieldProps as FieldProps<F> | undefined;
        const {
            labelWidth = fieldProps?.labelWidth,
            valueWidth = fieldProps?.valueWidth,
            field: {
                $field: {
                    domain: {className = ""}
                }
            }
        } = props;

        const theme = useTheme("field", fieldCss, fieldProps?.theme, props.theme);

        const {label, value, valueRef} = useField({...props, labelClassName: theme.label()});

        const style: Record<string, string> = {};
        if (labelWidth) {
            style["--field-label-width"] = labelWidth;
        }
        if (valueWidth) {
            style["--field-value-width"] = valueWidth;
        }

        return (
            <div className={classNames(theme.field(), className)} style={style}>
                {label}
                <div ref={valueRef} className={classNames(theme.value(), className)}>
                    {value}
                </div>
            </div>
        );
    });
}
