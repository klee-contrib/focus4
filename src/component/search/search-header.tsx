import * as React from "react";
import {autobind} from "core-decorators";
import {ComponentWithStore} from "../component-with-store";

import {AdvancedSearchStore} from "../../store/search";
import actionBuilder, {SearchAction} from "../../search/action-builder";
import {SearchActionService} from "../../search/search-action";
import {advancedSearchStore} from "../../search/built-in-store";
import * as defaults from "../defaults";

export interface Props {
    service: SearchActionService;
    store?: AdvancedSearchStore;
    action?: SearchAction;
    helpTranslationPath?: string;
    minChar?: number;
    onSearchCriteriaChangeByUser?: () => void;
    placeholder?: string;
    onSearchCriteriaChange?: (text: string) => void;
}

const {query, scope} = advancedSearchStore.definition;
export interface StoreNodes {
    query?: string;
    scope?: string;
}

@autobind
export default class extends ComponentWithStore<Props, {}, StoreNodes> {

    private action: SearchAction;

    constructor(props: Props) {
        const store = props.store || advancedSearchStore;
        super({
            props,
            store,
            storeNodes: {query, scope},
            referenceNames: ["scopes"]
        });
        this.state.isLoading = false;
        this.action = props.action || actionBuilder({
            service: props.service,
            identifier: store.identifier!,
            getSearchOptions: () => store.getValue.call(props.store)
        });
    }

    onChange(changeInfos: any, reset?: boolean) {
        if (this.props.onSearchCriteriaChange) {
            this.props.onSearchCriteriaChange(reset ? "" : (this.refs["search-bar"] as any).refs.query.getValue());
        }
    }

    reset() {
        this.action.updateProperties({query: ""});
        this.onChange(undefined, true);
    }

    render() {
        const {SearchBar, Button} = defaults;
        if (!SearchBar || !Button) {
            throw new Error("Les composants Button ou SearchBar n'ont pas été définis. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts.");
        }

        const {helpTranslationPath, minChar, onSearchCriteriaChangeByUser, placeholder, store} = this.props;
        const {isLoading, reference} = this.state;
        return (
            <div style={{display: "flex"}}>
                <SearchBar
                    ref="search-bar"
                    action={this.action}
                    helpTranslationPath={helpTranslationPath}
                    loading={isLoading}
                    minChar={minChar}
                    placeholder={placeholder}
                    scopes={reference && reference["scopes"]}
                    store={store}
                    onSearchCriteriaChangeByUser={onSearchCriteriaChangeByUser}
                    hasScopes={false}
                />
                <div style={{marginTop: "3px", marginLeft: "-35px"}}>
                    <Button icon="clear" handleOnClick={this.reset} shape="icon" />
                </div>
            </div>
        );
    }
}
