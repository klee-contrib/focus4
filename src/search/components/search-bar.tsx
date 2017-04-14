import {autobind} from "core-decorators";
import i18n from "i18next";
import {difference, toPairs} from "lodash";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Icon from "focus-components/icon";
import Select from "focus-components/select-mdl";

import { fieldFor, StoreNode, toFlatValues } from "../../entity";
import {injectStyle} from "../../theming";

import {SearchStore} from "../store";

import * as styles from "./__style__/search-bar.css";

export type SearchBarStyle = Partial<typeof styles>;

export interface SearchBarProps {
    classNames?: SearchBarStyle;
    criteriaComponent?: React.ReactElement<any>;
    disableInputCriteria?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    placeholder?: string;
    scopes?: {code: string; label?: string}[];
    store: SearchStore<StoreNode<{}>>;
}

@injectStyle("searchBar")
@autobind
@observer
export class SearchBar extends React.Component<SearchBarProps, void> {

    private input?: HTMLInputElement;

    @observable private criteriaList: string[] = [];
    @observable private showCriteriaComponent = false;

    @computed
    get flatCriteria() {
        const {criteria} = this.props.store;
        if (criteria) {
            return toPairs(toFlatValues(criteria));
        } else {
            return [];
        }
    }

    @computed
    get criteria() {
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
            return `${i18n.t(`${i18nPrefix}.search.bar.error`)} : ${error}`;
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
        }
    }

    @action
    onInputChange({currentTarget}: {currentTarget: HTMLInputElement}) {
        const {disableInputCriteria, store} = this.props;
        if (disableInputCriteria || !store.criteria) {
            store.query = currentTarget.value.trim();
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

    @action
    clear() {
        const {store} = this.props;
        store.query = "";
        if (store.criteria) {
            store.criteria.clear();
        }
    }

    toggleCriteria() {
        this.showCriteriaComponent = !this.showCriteriaComponent;
    }

    render() {
        const {i18nPrefix = "focus", placeholder, store, scopes, classNames, criteriaComponent} = this.props;
        return (
            <div style={{position: "relative"}}>
                <div className={`${styles.bar} ${classNames!.bar || ""} ${this.error ? `${styles.error} ${classNames!.error || ""}` : ""}`}>
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
                            onChange={this.onInputChange}
                            placeholder={i18n.t(placeholder || "")}
                            ref={input => this.input = input}
                            value={this.text}
                        />
                    </div>
                    {this.text && !this.showCriteriaComponent ? <Button icon="clear" onClick={this.clear} shape="icon" /> : null}
                    {store.criteria && criteriaComponent && !this.showCriteriaComponent ?
                        <Button icon={`keyboard_arrow_${this.showCriteriaComponent ? "up" : "down"}`} onClick={this.toggleCriteria} shape="icon" />
                    : null}
                </div>
                {!this.showCriteriaComponent && this.error ?
                    <span className={`${styles.errors} ${classNames!.errors || ""}`}>
                        {this.error}
                    </span>
                : null}
                {this.showCriteriaComponent ?
                    <div className={`${styles.criteria} ${classNames!.criteria || ""}`}>
                        <Button icon="clear" onClick={this.toggleCriteria} shape="icon" />
                        {fieldFor(store.query, {label: `${i18nPrefix}.search.bar.query`, onChange: query => store.query = query})}
                        {criteriaComponent}
                        <div className={`${styles.buttons} ${classNames!.buttons || ""}`}>
                            <Button color="primary" onClick={this.toggleCriteria} label={`${i18nPrefix}.search.bar.close`} />
                            <Button onClick={this.clear} shape={null} label={`${i18nPrefix}.search.bar.reset`} />
                        </div>
                    </div>
                : null}
            </div>
        );
    }
}
