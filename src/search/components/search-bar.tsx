import {autobind} from "core-decorators";
import i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";

import Icon from "focus-components/icon";
import Select from "focus-components/select-mdl";

import {injectStyle} from "../../theming";

import {SearchStore} from "../store";

import * as styles from "./__style__/search-bar.css";

export type SearchBarStyle = Partial<typeof styles>;

export interface SearchBarProps {
    classNames?: SearchBarStyle;
    placeholder?: string;
    scopes?: {code: string; label?: string}[];
    store: SearchStore;
}

@injectStyle("searchBar")
@autobind
@observer
export class SearchBar extends React.Component<SearchBarProps, void> {

    private input?: HTMLInputElement;

    componentDidMount() {
        this.focusQuery();
    }

    onScopeSelection(scope: string) {
        this.focusQuery();
        this.props.store.setProperties({
            groupingKey: undefined,
            scope: scope || "ALL",
            selectedFacets: {},
            sortAsc: true,
            sortBy: undefined
        });
    }

    focusQuery() {
        if (this.input) {
            this.input.focus();
        }
    }

    render() {
        const {placeholder, store, scopes, classNames} = this.props;
        return (
            <div className={`${styles.bar} ${classNames!.bar || ""}`}>
                {scopes ?
                    <Select
                        hasUndefined={true}
                        name="search-scope"
                        onChange={this.onScopeSelection}
                        rawInputValue={store.scope}
                        values={scopes}
                    />
                : null}
                <div className={`${styles.input} ${classNames!.input || ""}`}>
                    <Icon name="search" />
                    <input
                        name="search-bar-input"
                        onChange={({currentTarget}) => store.query = currentTarget.value}
                        placeholder={i18n.t(placeholder || "")}
                        ref={input => this.input = input}
                        value={store.query}
                    />
                </div>
            </div>
        );
    }
}
