import {autobind} from "core-decorators";
import i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import InputText from "focus-components/input-text";

import {injectStyle} from "../../../theming";

import {SearchStore} from "../../store";
import {Scope, ScopeSelect, ScopeSelectStyle} from "./scope-select";
export {ScopeSelectStyle};

import * as styles from "./style/search-bar.css";
export type SearchBarStyle = Partial<typeof styles>;

export interface SearchBarProps {
    classNames?: SearchBarStyle;
    hasScopes?: boolean;
    helpTranslationPath?: string;
    minChar?: number;
    onSearchCriteriaChange?: (query?: string, scope?: string) => void;
    placeholder?: string;
    scopes: Scope[];
    store: SearchStore;
}

@injectStyle("searchBar")
@autobind
@observer
export class SearchBar extends React.Component<SearchBarProps, void> {

    private input?: InputText;

    componentDidMount() {
        this.focusQuery();
    }

    onInputChange(query: string) {
        const {store, minChar = 0, onSearchCriteriaChange} = this.props;

        if (query.length >= minChar) {
            store.setProperties({query});
        }

        if (onSearchCriteriaChange) {
            onSearchCriteriaChange(store.query, store.scope);
        }
    }

    onScopeSelection(scope: string) {
        this.focusQuery();

        const {store, onSearchCriteriaChange} = this.props;

        store.setProperties({
            groupingKey: undefined,
            scope,
            selectedFacets: {},
            sortAsc: true,
            sortBy: undefined
        });

        if (onSearchCriteriaChange) {
            onSearchCriteriaChange(store.query, store.scope);
        }
    }

    focusQuery() {
        if (this.input) {
            this.input.refs.htmlInput.focus();
        }
    }

    reset() {
        const {store, onSearchCriteriaChange} = this.props;
        this.props.store.setProperties({query: ""});
        if (onSearchCriteriaChange) {
            onSearchCriteriaChange(store.query, store.scope);
        }
    }

    render() {
        let {placeholder} = this.props;
        const {hasScopes, store, scopes, classNames} = this.props;
        if (store.query && 0 < store.query.length) {
            placeholder = "";
        }
        return (
            <div style={{display: "flex"}}>
                <div className={`${styles.bar} ${classNames!.bar || ""}`}>
                    {hasScopes ?
                        <ScopeSelect list={scopes} onScopeSelection={this.onScopeSelection} ref="scope" value={store.scope} />
                    : null}
                    <div className={`${styles.input} ${classNames!.input || ""}`}>
                        <InputText
                            name="searchbarinput"
                            onChange={this.onInputChange}
                            placeholder={i18n.t(placeholder || "")}
                            ref={input => this.input = input}
                            rawInputValue={store.query}
                        />
                    {store.isLoading ?
                        <div className={`three-quarters-loader ${styles.spinner} ${classNames!.spinner || ""}`} />
                    : null}
                </div>
            </div>
                <div style={{marginTop: "3px", marginLeft: "-35px"}}>
                    <Button icon="clear" handleOnClick={this.reset} shape="icon" />
                </div>
            </div>
        );
    }
}
