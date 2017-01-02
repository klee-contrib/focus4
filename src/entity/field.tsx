import {autobind} from "core-decorators";
import i18n from "i18next";
import {find, omit, result} from "lodash";
import {computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import InputText from "focus-components/input-text";
import Label from "focus-components/label";

import {injectStyle, StyleInjector} from "../theming";

import {Domain} from "./types";
import {validate} from "./validation";

import * as styles from "./style/field.css";
export type FieldStyle = Partial<typeof styles>;

export interface FieldProps extends Domain {

    // Props passées aux composants Display/Field/Input.
    domain?: Domain;
    error?: string | null;
    isEdit?: boolean;
    labelKey?: string;
    name?: string;
    value?: any;
    valueKey?: string;
    values?: any[];

    // Props propres au Field.
    classNames?: FieldStyle;
    contentCellPosition?: string;
    contentOffset?: number;
    contentSize?: number;
    hasLabel?: boolean;
    isRequired?: boolean;
    label?: string;
    labelCellPosition?: string;
    labelOffset?: number;
    labelSize?: number;
}

const omittedProps = [
    "classNames",
    "contentCellPosition",
    "contentOffset",
    "contentSize",
    "hasLabel",
    "isRequired",
    "label",
    "labelCellPosition",
    "labelOffset",
    "labelSize",
    "validator",
    "DisplayComponent",
    "FieldComponent",
    "InputComponent",
    "LabelComponent"
];

@injectStyle("field")
@autobind
@observer
export class Field extends React.Component<FieldProps & {ref: (field: StyleInjector<Field>) => void}, void> {

    @observable showError = false;

    componentWillUpdate({value}: FieldProps) {
        if (value) {
            this.showError = true;
        }
    }

    @computed
    get error(): string | undefined {
        const {error, value} = this.props;

        if (error !== undefined) {
            return error || undefined;
        }

        const {isRequired, validator, label = ""} = this.props;
        if (isRequired && (undefined === value || null === value || "" === value)) {
            return i18n.t("field.required");
        }

        if (validator && value !== undefined && value !== null) {
            const validStat = validate({value, name: i18n.t(label)}, validator);
            if (validStat.errors.length) {
                return i18n.t(validStat.errors.join(", "));
            }
        }

        return undefined;
    }

    display() {
        const {valueKey, labelKey, values, value: rawValue, formatter, DisplayComponent} = this.props;
        const value = values ? result(find(values, {[valueKey || "code"]: rawValue}), labelKey || "label") : rawValue;
        const props = {...omit(this.props, omittedProps), value};
        const FinalDisplay = DisplayComponent || (() => <div>{formatter && formatter(value) || value}</div>);
        return <FinalDisplay {...props} />;
    }

    field() {
        const {FieldComponent} = this.props;
        const valid = !(this.showError && this.error);
        if (FieldComponent) {
            const props = omit(this.props, omittedProps);
            return <FieldComponent {...props} valid={valid} error={valid ? undefined : this.error} />;
        } else {
            return null;
        }
    }

    input() {
        const {InputComponent, formatter, value} = this.props;
        const props = omit(this.props, omittedProps);
        const FinalInput = InputComponent || InputText;
        const valid = !(this.showError && this.error);
        return <FinalInput {...props} formattedInputValue={formatter && formatter(value) || value} rawInputValue={value} valid={valid} error={valid ? undefined : this.error} />;
    }

    label() {
        const {name, label, LabelComponent, domain, labelCellPosition = "top", labelSize = 4, labelOffset = 0, classNames} = this.props;
        const FinalLabel = LabelComponent || Label;
        return (
            <div className ={`${getCellGridClassName(labelCellPosition, labelSize, labelOffset)} ${styles.label} ${classNames!.label || ""}`}>
                <FinalLabel
                    domain={domain}
                    name={name}
                    text={label}
                />
            </div>
        );
    }

    render() {
        const {FieldComponent, contentCellPosition = "top", contentSize = 12, labelSize = 4, contentOffset = 0, isRequired, hasLabel, isEdit, domain, classNames, className = ""} = this.props;
        return (
            <div className={`mdl-grid ${styles.field} ${classNames!.field || ""} ${isEdit ? `${styles.edit} ${classNames!.edit || ""}` : ""} ${this.error && this.showError ? `${styles.invalid} ${classNames!.invalid || ""}` : ""} ${isRequired ? `${styles.required} ${classNames!.required || ""}` : ""} ${domain && domain.className ? domain.className : ""}`}>
                {FieldComponent ? this.field() : null}
                {!FieldComponent && hasLabel ? this.label() : null}
                {!FieldComponent ?
                    <div className ={`${getCellGridClassName(contentCellPosition, contentSize - labelSize, contentOffset)} ${styles.value} ${classNames!.value || ""} ${className}`}>
                        {isEdit ? this.input() : this.display()}
                    </div>
                : null}
            </div>
        );
    }
}

function buildGridClassName(prop: string | number, suffix?: string) {
    return " mdl-cell--" + prop + (suffix ? suffix : "");
}

function getCellGridClassName(position: string, size: number, offset: number) {
    const cellPosition = buildGridClassName(position);
    const cellSize = buildGridClassName(size, "-col");
    const cellOffset = buildGridClassName(offset, "-offset");
    return "mdl-cell" + cellPosition + cellSize + cellOffset;
}
