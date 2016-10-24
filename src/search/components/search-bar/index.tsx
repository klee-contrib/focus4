import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";

import Button from "focus-components/button";
import InputText from "focus-components/input-text";

import {SearchStore} from "../../store";
import {Scope, ScopeSelect} from "./scope-select";

import {bar, input, spinner} from "./style/index.css";

export interface Props {
    hasScopes?: boolean;
    helpTranslationPath?: string;
    minChar?: number;
    onSearchCriteriaChange?: (query?: string, scope?: string) => void;
    placeholder?: string;
    scopes: Scope[];
    store: SearchStore;
}

@autobind
@observer
export class SearchBar extends React.Component<Props, void> {

    componentDidMount() {
        this.focusQuery();
    }

    onInputChange(query: string) {
        const {store, minChar, onSearchCriteriaChange} = this.props;

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
            scope,
            selectedFacets: {},
            groupingKey: undefined,
            sortBy: undefined,
            sortAsc: true
        });

        if (onSearchCriteriaChange) {
            onSearchCriteriaChange(store.query, store.scope);
        }
    }

    focusQuery() {
        (findDOMNode(this.refs["query"]) as HTMLInputElement).focus();
    }

    reset() {
        const {store, onSearchCriteriaChange} = this.props;
        this.props.store.setProperties({query: ""});
        if (onSearchCriteriaChange) {
            onSearchCriteriaChange(store.query, store.scope);
        }
    }

    render() {
        let {hasScopes, placeholder, store, scopes} = this.props;
        if (store.query && 0 < store.query.length) {
            placeholder = "";
        }
        return (
            <div style={{display: "flex"}}>
                <div className={bar}>
                    {hasScopes ?
                        <ScopeSelect list={scopes} onScopeSelection={this.onScopeSelection} ref="scope" value={store.scope} />
                    : null}
                    <div className={input}>
                        <InputText
                            name="searchbarinput"
                            onChange={this.onInputChange}
                            placeholder={i18n.t(placeholder || "")}
                            ref="query"
                            value={store.query}
                        />
                    {store.isLoading ?
                        <div className={`three-quarters-loader ${spinner}`} />
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
