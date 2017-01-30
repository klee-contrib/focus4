import {autobind} from "core-decorators";
import * as React from "react";

import Dropdown from "focus-components/dropdown";

import {injectStyle} from "../../../theming";

import * as styles from "./style/scope-select.css";
export type ScopeSelectStyle = Partial<typeof styles>;

export interface Scope {
    code: string;
    label: string;
    icon?: string;
    iconLibrary?: string;
}

export interface ScopeSelectProps {
    classNames?: ScopeSelectStyle;
    list: Scope[];
    onScopeSelection?: (code: string) => void;
    value: string | number;
}

@injectStyle("scopeSelect")
@autobind
export class ScopeSelect extends React.Component<ScopeSelectProps, void> {

    getScopeClickHandler(code: string) {
        const {onScopeSelection} = this.props;
        return () => {
            if (onScopeSelection) {
                onScopeSelection(code);
            }
        };
    }

    getActiveScope() {
        const {list, value} = this.props;
        return list.find(item => item.code === value);
    }

    render() {
        const {icon: bIcon = "", label: bLabel = ""} = this.getActiveScope() || {};
        return (
            <div className={`${styles.scope} ${this.props.classNames!.scope || ""}`}>
                <Dropdown
                    button={{icon: bIcon, label: bLabel}}
                    operations={this.props.list.map(({code, label, icon, iconLibrary}) => ({
                        code, label, icon, iconLibrary,
                        action: this.getScopeClickHandler(code)
                    }))}
                />
            </div>
        );
    }
}
