import classNames from "classnames";
import {autobind} from "core-decorators";
import {computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {themeable} from "@focus4/core";
import {fieldCss, FieldCss, Label, LabelProps} from "@focus4/forms";
import {validateField} from "@focus4/stores";
import {CSSProp, themr, ToBem} from "@focus4/styling";

import {Display, DisplayProps, Input, InputProps} from "../components";

import {Domain} from "./domain";

const Theme = themr("field", fieldCss);

/** Props pour le Field, se base sur le contenu d'un domaine. */
export interface FieldProps<
    T = any, // Type de la valeur.
    ICProps extends {theme?: {}} = InputProps, // Props du composant d'input.
    DCProps extends {theme?: {}} = DisplayProps, // Props du component d'affichage.
    LCProps = LabelProps, // Props du component de libellé.
    R = any, // Type de la liste de référence associée.
    VK extends string = any, // Nom de la propriété de valeur (liste de référence).
    LK extends string = any // Nom de la propriété de libellé (liste de référence).
> extends Domain<T, ICProps, DCProps, LCProps> {
    /** Commentaire à afficher dans la tooltip. */
    comment?: string;
    /** Désactive le style inline qui spécifie la largeur du label et de la valeur.  */
    disableInlineSizing?: boolean;
    /** Surcharge l'erreur du field. */
    error?: string | null;
    /** Force l'affichage de l'erreur, même si le champ n'a pas encore été modifié. */
    forceErrorDisplay?: boolean;
    /** Service de résolution de code. */
    keyResolver?: (key: number | string) => Promise<string | undefined>;
    /** Affiche le label. */
    hasLabel?: boolean;
    /** Pour l'icône de la Tooltip. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Champ en édition. */
    isEdit?: boolean;
    /** Champ requis. */
    isRequired?: boolean;
    /** Libellé du champ. */
    label?: string;
    /** Par défaut : "top". */
    labelCellPosition?: string;
    /** Nom de la propriété de libellé. Doit être casté en lui-même (ex: `{labelKey: "label" as "label"}`). Par défaut: "label". */
    labelKey?: LK;
    /** Largeur en % du label. Par défaut : 33. */
    labelRatio?: number;
    /** Nom du champ. */
    name: string;
    /** Handler de modification de la valeur. */
    onChange?: (value: T) => void;
    /** Ref. */
    ref?: (i: Field<T, ICProps, DCProps, LCProps, R, VK, LK>) => void;
    /** Affiche la tooltip. */
    showTooltip?: boolean;
    /** CSS. */
    theme?: CSSProp<FieldCss>;
    /** Valeur. */
    value: any;
    /** Nom de la propriété de valeur. Doit être casté en lui-même (ex: `{valueKey: "code" as "code"}`). Par défaut: "code". */
    valueKey?: VK;
    /** Largeur en % de la valeur. Par défaut : 100 - `labelRatio`. */
    valueRatio?: number;
    /** Liste des valeurs de la liste de référence. Doit contenir les propriétés `valueKey` et `labelKey`. */
    values?: R[];
}

/** Composant de champ, gérant des composants de libellé, d'affichage et/ou d'entrée utilisateur. */
@autobind
@observer
export class Field<
    T,
    ICProps extends InputProps,
    DCProps extends DisplayProps,
    LCProps extends LabelProps,
    R,
    VK extends string,
    LK extends string
> extends React.Component<FieldProps<T, ICProps, DCProps, LCProps, R, VK, LK>> {
    /** Affiche l'erreur du champ. Initialisé à `false` pour ne pas afficher l'erreur dès l'initilisation du champ avant la moindre saisie utilisateur. */
    @observable showError = this.props.forceErrorDisplay || false;

    componentWillUpdate({value}: FieldProps<T, ICProps, DCProps, LCProps, R, VK, LK>) {
        // On affiche l'erreur dès que et à chaque fois que l'utilisateur modifie la valeur (et à priori pas avant).
        if (value) {
            this.showError = true;
        }
    }

    /** Récupère l'erreur associée au champ. Si la valeur vaut `undefined`, alors il n'y en a pas. */
    @computed
    get error(): string | undefined {
        const {error, value, isRequired = false, validator} = this.props;

        // On priorise l'éventuelle erreur passée en props.
        if (error !== undefined) {
            return error || undefined;
        }

        return validateField(value, isRequired, validator);
    }

    /** Appelé lors d'un changement sur l'input. */
    onChange(value: any) {
        const {onChange, unformatter = (x: string) => x} = this.props;
        if (onChange) {
            onChange(unformatter(value));
        }
    }

    /** Affiche le composant d'affichage (`DisplayComponent`). */
    display() {
        const {
            valueKey = "code",
            labelKey = "label",
            values,
            value,
            keyResolver,
            displayFormatter,
            DisplayComponent,
            displayProps = {} as DCProps
        } = this.props;
        const FinalDisplay = DisplayComponent || (Display as any);
        return (
            <FinalDisplay
                {...displayProps}
                formatter={displayFormatter}
                keyResolver={keyResolver}
                labelKey={labelKey}
                theme={displayProps.theme}
                value={value}
                valueKey={valueKey}
                values={values}
            />
        );
    }

    /** Affiche le composant d'entrée utilisateur (`InputComponent`). */
    input(theme: ToBem<FieldCss>) {
        const {
            InputComponent,
            inputFormatter,
            value,
            valueKey = "code",
            labelKey = "label",
            values,
            keyResolver,
            inputProps = {} as ICProps,
            name
        } = this.props;
        const FinalInput = InputComponent || Input;

        let props: any = {
            ...inputProps,
            value: (inputFormatter && inputFormatter(value)) || value,
            error: (this.showError && this.error) || undefined,
            name,
            id: name,
            onChange: this.onChange,
            theme: themeable({error: theme.error()}, inputProps.theme || ({} as any))
        };

        if (values) {
            props = {...props, values, labelKey, valueKey};
        }

        if (keyResolver) {
            props = {...props, keyResolver};
        }

        return <FinalInput {...props} />;
    }

    render() {
        return (
            <Theme theme={this.props.theme}>
                {theme => {
                    const {
                        comment,
                        disableInlineSizing,
                        i18nPrefix,
                        label,
                        LabelComponent,
                        name,
                        showTooltip,
                        hasLabel = true,
                        labelRatio = 33,
                        isRequired,
                        isEdit,
                        className = ""
                    } = this.props;
                    const {valueRatio = 100 - (hasLabel ? labelRatio : 0)} = this.props;
                    const FinalLabel = LabelComponent || (Label as any);
                    return (
                        <div
                            className={classNames(
                                theme.field({
                                    edit: isEdit,
                                    error: !!(isEdit && this.error && this.showError),
                                    required: isRequired
                                }),
                                className
                            )}
                        >
                            {hasLabel ? (
                                <FinalLabel
                                    comment={comment}
                                    i18nPrefix={i18nPrefix}
                                    label={label}
                                    name={name}
                                    showTooltip={showTooltip}
                                    style={!disableInlineSizing ? {width: `${labelRatio}%`} : {}}
                                    theme={{label: theme.label()}}
                                />
                            ) : null}
                            <div
                                style={!disableInlineSizing ? {width: `${valueRatio}%`} : {}}
                                className={classNames(theme.value(), className)}
                            >
                                {isEdit ? this.input(theme) : this.display()}
                            </div>
                        </div>
                    );
                }}
            </Theme>
        );
    }
}
