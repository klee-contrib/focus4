import {autobind} from "core-decorators";
import i18n from "i18next";
import {difference, toPairs} from "lodash";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Icon from "focus-components/icon";
import Select from "focus-components/select-mdl";

import {toFlatValues} from "../../entity";
import {injectStyle} from "../../theming";

import {SearchStore} from "../store";

import * as styles from "./__style__/search-bar.css";

export type SearchBarStyle = Partial<typeof styles>;

export interface SearchBarProps {
    classNames?: SearchBarStyle;
    CriteriaComponent?: React.ReactElement<any>;
    disableInputCriteria?: boolean;
    placeholder?: string;
    scopes?: {code: string; label?: string}[];
    store: SearchStore<any>;
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
        return toPairs(toFlatValues(this.props.store.criteria));
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
        if (disableInputCriteria) {
            store.query = currentTarget.value.trim();
        } else {
            const tokens = currentTarget.value.trim().split(" ");
            let token = tokens[0];
            let skip = 0;
            this.criteriaList = [];
            while (1) {
                const [crit = "", value = ""] = token && token.split(/:(.+)/) || [];
                if (crit && value && store.criteria[crit] && !this.criteriaList.find(u => u === crit)) {
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

    render() {
        const {placeholder, store, scopes, classNames, CriteriaComponent} = this.props;
        return (
            <div>
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
                            onChange={this.onInputChange}
                            placeholder={i18n.t(placeholder || "")}
                            ref={input => this.input = input}
                            value={this.text}
                        />
                    </div>
                    {CriteriaComponent ? <Button icon={`keyboard_arrow_${this.showCriteriaComponent ? "up" : "down"}`} onClick={() => this.showCriteriaComponent = !this.showCriteriaComponent} shape="icon" /> : null}
                </div>
                {this.showCriteriaComponent ? CriteriaComponent : null}
            </div>
        );
    }
}
