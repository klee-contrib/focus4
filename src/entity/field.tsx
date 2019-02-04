import {autobind} from "core-decorators";
import i18next from "i18next";
import {computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themeable} from "react-css-themr";

import {Display, DisplayProps, Input, InputProps, Label, LabelProps} from "../components";
import {themr} from "../theme";

import {Domain} from "./types";
import {validate} from "./validation";

import * as styles from "./__style__/field.css";
export type FieldStyle = Partial<typeof styles>;
const Theme = themr("field", styles);

/** Props pour le Field, se base sur le contenu d'un domaine. */
export interface FieldProps<
    T = any, // Type de la valeur.
    ICProps extends {theme?: {}} = InputProps, // Props du composant d'input.
    DCProps extends {theme?: {}} = DisplayProps, // Props du component d'affichage.
    LCProps = LabelProps, // Props du component de libellé.
    R = any, // Type de la liste de référence associée.
    VK extends string = any, // Nom de la propriété de valeur (liste de référence).
    LK extends string = any // Nom de la propriété de libellé (liste de référence).
> extends Domain<ICProps, DCProps, LCProps> {
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
    /** A utiliser à la place de `ref`. */
    innerRef?: (i: Field<T, ICProps, DCProps, LCProps, R, VK, LK>) => void;
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
    /** Affiche la tooltip. */
    showTooltip?: boolean;
    /** CSS. */
    theme?: FieldStyle & {display?: DCProps["theme"]; input?: ICProps["theme"]};
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
        const {error, value} = this.props;

        // On priorise l'éventuelle erreur passée en props.
        if (error !== undefined) {
            return error || undefined;
        }

        // On vérifie que le champ n'est pas vide et obligatoire.
        const {isRequired, validator, label = ""} = this.props;
        if (
            isRequired &&
            (value === undefined || value === null || (typeof value === "string" && value.trim() === ""))
        ) {
            return i18next.t("focus.validation.required");
        }

        // On applique le validateur du domaine.
        if (validator && value !== undefined && value !== null) {
            const validStat = validate({value, name: i18next.t(label)}, validator);
            if (validStat.errors.length) {
                return i18next.t(validStat.errors.join(", "));
            }
        }

        // Pas d'erreur.
        return undefined;
    }

    /** Appelé lors d'un changement sur l'input. */
    onChange(value: any) {
        const {onChange, unformatter = (x: string) => x} = this.props;
        if (onChange) {
            onChange(unformatter(value));
        }
    }

    /** Affiche le composant d'affichage (`DisplayComponent`). */
    display(theme: FieldStyle & {display?: DCProps["theme"]; input?: ICProps["theme"]}) {
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
                theme={themeable(displayProps.theme || ({} as any), theme!.display as any)}
                value={value}
                valueKey={valueKey}
                values={values}
            />
        );
    }

    /** Affiche le composant d'entrée utilisateur (`InputComponent`). */
    input(theme: FieldStyle & {display?: DCProps["theme"]; input?: ICProps["theme"]}) {
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
            theme: themeable(inputProps.theme || ({} as any), theme!.input as any)
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
                            className={`${theme!.field} ${isEdit ? theme!.edit : ""} ${
                                this.error && this.showError ? theme!.invalid : ""
                            } ${isRequired ? theme!.required : ""} ${className}`}
                        >
                            {hasLabel ? (
                                <FinalLabel
                                    comment={comment}
                                    i18nPrefix={i18nPrefix}
                                    label={label}
                                    name={name}
                                    showTooltip={showTooltip}
                                    style={!disableInlineSizing ? {width: `${labelRatio}%`} : {}}
                                    theme={{label: theme!.label}}
                                />
                            ) : null}
                            <div
                                style={!disableInlineSizing ? {width: `${valueRatio}%`} : {}}
                                className={`${theme!.value} ${className}`}
                            >
                                {isEdit ? this.input(theme) : this.display(theme)}
                            </div>
                        </div>
                    );
                }}
            </Theme>
        );
    }
}
