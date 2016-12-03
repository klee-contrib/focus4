import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {find, isFunction, omit, result} from "lodash";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import DisplayText from "focus-components/input-display/text";
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
    ref?: (field: StyleInjector<Field>) => void;
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
export class Field extends React.Component<FieldProps, void> {

    @observable error?: string;

    inputField?: {validate?: () => {isValid: boolean, message?: string}};

    display() {
        const {valueKey, labelKey, values, value: rawValue, DisplayComponent} = this.props;
        const value = values ? result(find(values, {[valueKey || "code"]: rawValue}), labelKey || "label") : rawValue;
        const props = {...omit(this.props, omittedProps), value};
        const FinalDisplay = DisplayComponent || DisplayText;
        return <FinalDisplay {...props} />;
    }

    field() {
        const {FieldComponent} = this.props;
        if (FieldComponent) {
            const props = omit(this.props, omittedProps);
            return <FieldComponent {...props} error={this.error} />;
        } else {
            return null;
        }
    }

    input() {
        const {InputComponent} = this.props;
        const props = omit(this.props, omittedProps);
        const FinalInput = InputComponent || InputText;
        return <FinalInput ref={(input: any) => this.inputField = input} {...props} error={this.error} />;
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

    validateDomain() {
        const {value} = this.props;
        let {isRequired, validator, label = ""} = this.props;
        if (isRequired && (undefined === value || null === value || "" === value)) {
            this.error = i18n.t("field.required");
            return false;
        }

        if (validator && value !== undefined && value !== null) {
            let validStat = validate({value, name: i18n.t(label)}, validator);
            if (validStat.errors.length) {
                this.error = i18n.t(validStat.errors.join(", "));
                return false;
            }
        }

        return true;
    }

    validate() {
        const domainValidation = this.validateDomain();
        if (!domainValidation) {
            return false;
        }

        if (this.inputField && isFunction(this.inputField.validate)) {
            const componentValidation = this.inputField.validate();
            if (!componentValidation.isValid) {
                this.error = i18n.t(componentValidation.message!);
                return false;
            }
        }

        return true;
    }

    render() {
        const {FieldComponent, contentCellPosition = "top", contentSize = 12, labelSize = 4, contentOffset = 0, isRequired, hasLabel, isEdit, domain, classNames} = this.props;
        return (
            <div className={`mdl-grid ${styles.field} ${classNames!.field || ""} ${isEdit ? `${styles.edit} ${classNames!.edit || ""}` : ""} ${this.error ? `${styles.invalid} ${classNames!.invalid || ""}` : ""} ${isRequired ? `${styles.required} ${classNames!.required || ""}` : ""} ${domain && domain.className ? domain.className : ""}`}>
                {FieldComponent ? this.field() : null}
                {!FieldComponent && hasLabel ? this.label() : null}
                {!FieldComponent ?
                    <div className ={`${getCellGridClassName(contentCellPosition, contentSize - labelSize, contentOffset)} ${styles.value} ${classNames!.value || ""}`}>
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
