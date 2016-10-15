import {autobind} from "core-decorators";
import * as React from "react";

import * as defaults from "../../../defaults";

export interface Scope {
    code: string;
    label: string;
    icon?: string;
    iconLibrary?: string;
}

export interface ScopeProps {
    list: Scope[];
    onScopeSelection?: (code: string) => void;
    value: string | number;
}

@autobind
export class ScopeSelect extends React.Component<ScopeProps, void> {

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
        const {icon: bIcon = undefined, label: bLabel = undefined} = this.getActiveScope() || {};
        const {Dropdown} = defaults;
        if (!Dropdown) {
            throw new Error("Dropdown manque");
        }
        return (
            <div data-focus="search-bar-scope" ref="parent">
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
