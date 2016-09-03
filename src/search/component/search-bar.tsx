import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";

import {translate} from "../..";
import * as defaults from "../../defaults";

import {SearchStore} from "../store";

export interface Props {
    hasScopes?: boolean;
    helpTranslationPath?: string;
    minChar?: number;
    onSearchCriteriaChange?: (query?: string, scope?: string) => void;
    placeholder?: string;
    scopes: {code: string, label: string}[];
    store: SearchStore;
}

@autobind
@observer
export class SearchBar extends React.Component<Props, {}> {

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
        const {Scope, Button, InputText} = defaults;
        if (!Scope || !Button || !InputText) {
            throw new Error("Les composants Button, Scope ou InputText n'ont pas été définis. Utiliser 'autofocus/defaults' pour enregistrer les défauts.");
        }

        let {hasScopes, placeholder, store, scopes} = this.props;
        if (store.query && 0 < store.query.length) {
            placeholder = "";
        }

        return (
            <div style={{display: "flex"}}>
                <div data-focus="search-bar">
                    {hasScopes ?
                        <Scope list={scopes} onScopeSelection={this.onScopeSelection} ref="scope" value={store.scope}/>
                    : null}
                    <div data-focus="search-bar-input">
                        <InputText
                            name="searchbarinput"
                            onChange={this.onInputChange}
                            placeholder={translate(placeholder || "")}
                            ref="query"
                            value={store.query}
                        />
                    {store.isLoading ?
                        <div className="three-quarters-loader" data-role="spinner"></div>
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
