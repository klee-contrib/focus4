import {autobind} from "core-decorators";
import i18next from "i18next";
import {difference, toPairs} from "lodash";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {Button, IconButton} from "react-toolbox/lib/button";
import {Dropdown} from "react-toolbox/lib/dropdown";
import {FontIcon} from "react-toolbox/lib/font_icon";

import {fieldFor, StoreNode, toFlatValues} from "../../entity";

import {SearchStore} from "../store";

import { getIcon } from "../../components/icon";
import * as styles from "./__style__/search-bar.css";

export type SearchBarStyle = Partial<typeof styles>;

export interface SearchBarProps<T, C extends StoreNode> {
    criteriaComponent?: React.ReactElement<any>;
    disableInputCriteria?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    innerRef?: (instance: SearchBar<T, C>) => void;
    placeholder?: string;
    scopeKey?: keyof C;
    scopes?: {code: string; label: string}[];
    store: SearchStore<T, C>;
    theme?: SearchBarStyle;
}

@autobind
@observer
export class SearchBar<T, C extends StoreNode> extends React.Component<SearchBarProps<T, C>, void> {

    protected input?: HTMLInputElement;

    @observable protected criteriaList: string[] = [];
    @observable protected showCriteriaComponent = false;

    @computed
    protected get flatCriteria() {
        const {criteria} = this.props.store;
        if (criteria) {
            return toPairs(toFlatValues(criteria));
        } else {
            return [];
        }
    }

    @computed
    protected get criteria() {
        return this.criteriaList.filter(crit => this.flatCriteria.map(([c, _]) => c).find(c => c === crit));
    }

    @computed
    get text() {
        const {disableInputCriteria, store} = this.props;
        if (disableInputCriteria) {
            return store.query;
        } else {
            const criteria = this.criteria.concat(difference(this.flatCriteria.map(c => c[0]), this.criteria))
                .map(c => [c, this.flatCriteria.find(i => i[0] === c) && this.flatCriteria.find(i => i[0] === c)![1]])
                .filter(([_, value]) => value)
                .map(([key, value]) => `${key}:${value}`);
            return `${criteria.join(" ")}${criteria.length && (store.query && store.query.trim()) ? " " : ""}${store.query}`;
        }
    }

    @computed
    get error() {
        const {i18nPrefix = "focus", store} = this.props;
        const error = toPairs(store.criteriaErrors)
            .filter(([_, isError]) => isError)
            .map(([crit]) => crit)
            .join(", ");
        if (error) {
            return `${i18next.t(`${i18nPrefix}.search.bar.error`)} : ${error}`;
        } else {
            return undefined;
        }
    }

    componentDidMount() {
        this.focusQuery();
    }

    focusQuery() {
        if (this.input) {
            this.input.focus();
            this.input.setSelectionRange(this.text.length, this.text.length);
        }
    }

    @action
    protected onInputChange({currentTarget}: {currentTarget: HTMLInputElement}) {
        const {disableInputCriteria, store} = this.props;
        if (disableInputCriteria || !store.criteria) {
            store.query = currentTarget.value;
        } else if (store.criteria) {
            const tokens = currentTarget.value.trim().split(" ");
            let token = tokens[0];
            let skip = 0;
            this.criteriaList = [];
            while (1) {
                const [crit = "", value = ""] = token && token.split(/:(.+)/) || [];
                if (crit && value && (store.criteria as any)[crit] && !this.criteriaList.find(u => u === crit)) {
                    (store.criteria as any)[crit].value = value;
                    skip++;
                    this.criteriaList.push(crit);
                    token = tokens[skip];
                } else {
                    break;
                }
            }

            difference(Object.keys(toFlatValues(store.criteria)), this.criteriaList).forEach(crit => (store.criteria as any)[crit].value = undefined);
            store.query = `${tokens.slice(skip).join(" ")}${currentTarget.value.match(/\s*$/)![0]}`;
        }
    }

    @action
    protected onScopeSelection(scope: string) {
        const {scopeKey, store} = this.props;
            if (store.criteria && scopeKey) {
            this.focusQuery();
            store.setProperties({
                groupingKey: undefined,
                selectedFacets: {},
                sortAsc: true,
                sortBy: undefined
            });
           (store.criteria[scopeKey] as any).value = scope;
        }
    }

    @action
    protected clear() {
        const {disableInputCriteria, store} = this.props;
        store.query = "";
        if (store.criteria && !disableInputCriteria) {
            store.criteria.clear();
        }
    }

    protected toggleCriteria() {
        this.showCriteriaComponent = !this.showCriteriaComponent;
        this.props.store.blockSearch = !this.props.store.blockSearch;
    }

    render() {
        const {i18nPrefix = "focus", placeholder, store, scopeKey, scopes, theme, criteriaComponent} = this.props;
        return (
            <div style={{position: "relative"}}>
                {this.showCriteriaComponent ? <div className={theme!.criteriaWrapper} onClick={this.toggleCriteria} /> : null}
                <div className={`${theme!.bar} ${this.error ? theme!.error : ""}`}>
                    {scopes && store.criteria && scopeKey ?
                        <Dropdown
                            onChange={this.onScopeSelection}
                            value={(store.criteria[scopeKey] as any).value}
                            source={[{value: undefined, label: ""}, ...scopes.map(({code, label}) => ({value: code, label}))]}
                            theme={{dropdown: theme!.dropdown, values: theme!.scopes, valueKey: ""}}
                        />
                    : null}
                    <div className={theme!.input}>
                        <FontIcon className={theme!.searchIcon}>{getIcon(`${i18nPrefix}.icons.searchBar.search`)}</FontIcon>
                        <input
                            name="search-bar-input"
                            onChange={this.onInputChange}
                            placeholder={i18next.t(placeholder || "")}
                            ref={input => this.input = input}
                            value={this.text}
                        />
                    </div>
                    {this.text && !this.showCriteriaComponent ? <IconButton icon={getIcon(`${i18nPrefix}.icons.searchBar.clear`)} onClick={this.clear} /> : null}
                    {store.criteria && criteriaComponent && !this.showCriteriaComponent ?
                        <IconButton icon={getIcon(`${i18nPrefix}.icons.searchBar.open`)} onClick={this.toggleCriteria} />
                    : null}
                </div>
                {!this.showCriteriaComponent && this.error ?
                    <span className={theme!.errors}>
                        {this.error}
                    </span>
                : null}
                {this.showCriteriaComponent ?
                    <div className={theme!.criteria}>
                        <IconButton icon={getIcon(`${i18nPrefix}.icons.searchBar.close`)} onClick={this.toggleCriteria} />
                        {fieldFor(store.query, {label: `${i18nPrefix}.search.bar.query`, onChange: (query: string) => store.query = query})}
                        {criteriaComponent}
                        <div className={theme!.buttons}>
                            <Button primary raised onClick={this.toggleCriteria} label={`${i18nPrefix}.search.bar.search`} />
                            <Button onClick={this.clear} label={`${i18nPrefix}.search.bar.reset`} />
                        </div>
                    </div>
                : null}
            </div>
        );
    }
}

export default themr("searchBar", styles)(SearchBar);
