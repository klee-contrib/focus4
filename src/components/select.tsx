import {autobind} from "core-decorators";
import i18next from "i18next";
import {isNull, isUndefined, union} from "lodash";
import * as React from "react";
import {themr} from "react-css-themr";

import * as styles from "./__style__/select.css";
export type SelectStyle = Partial<typeof styles>;

export interface SelectProps {
    autoFocus?: boolean;
    disabled?: boolean;
    error?: string | null;
    hasUndefined?: boolean;
    isRequired?: boolean;
    labelKey: string;
    name: string;
    onChange: (value: string | number) => void;
    size?: number;
    style?: React.CSSProperties;
    theme?: SelectStyle;
    unSelectedLabel?: string;
    value?: string | number;
    valueKey: string;
    values: {}[];
}

@autobind
export class Select extends React.Component<SelectProps, void> {

    _handleSelectChange(evt: any) {
        const {value} = evt.target;
        return this.props.onChange(value ? value : undefined);
    }

    _renderOptions({hasUndefined = true, labelKey, isRequired, value, values = [], valueKey, unSelectedLabel = "select.unSelected"}: SelectProps) {
        const isRequiredAndNoValue = isRequired && (isUndefined(value) || isNull(value));
        if (hasUndefined || isRequiredAndNoValue) {
            values = union(
                [{[labelKey]: i18next.t(unSelectedLabel), [valueKey]: ""}],
                values
            );
        }
        return values
            .map((val, idx) => {
                const optVal = `${(val as any)[valueKey]}`;
                const elementValue = (val as any)[labelKey];
                const optLabel = isUndefined(elementValue) || isNull(elementValue) ? i18next.t("focus.components.input.select.noLabel") : elementValue;
                return (<option key={idx} value={optVal}>{optLabel}</option>);
            });
    }

    render() {
        const {autoFocus, error, name, style, value, disabled, size, theme} = this.props;
        const selectProps = {autoFocus, disabled, size};
        return (
            <div data-focus="select" className={`${theme!.select} ${error ? theme!.error! : ""}`} style={style}>
                <select name={name} onChange={this._handleSelectChange} value={value || ""} {...selectProps}>
                    {this._renderOptions(this.props)}
                </select>
                {error ? <div className={theme!.errorLabel!}>{error}</div> : null}
            </div>
        );
    }
}

export default themr("select", styles)(Select);
