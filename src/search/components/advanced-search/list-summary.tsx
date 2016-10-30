import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";

import {TopicDisplayer} from"../../../list";
import {SearchStore} from "../../store";

import {injectStyle} from "../../../theming";

import * as styles from "./style/list-summary.css";
export type ListSummaryStyle = typeof styles;

export interface ListSummaryProps {
    classNames?: ListSummaryStyle;
    exportAction?: () => void;
    scopes: {code: string, label: string}[];
    scopeLock: boolean;
    store: SearchStore;
}

@injectStyle("listSummary")
@autobind
@observer
export class ListSummary extends React.Component<ListSummaryProps, void> {
    static defaultProps = {
        totalCount: 0,
        query: ""
    };

    private onScopeClick() {
        this.props.store.setProperties({
            scope: "ALL",
            selectedFacets: {},
            groupingKey: undefined
        });
    }

    private get scopeLabel() {
        const {store, scopes} = this.props;
        const selectedScope = scopes.find(sc => sc.code === store.scope);
        return selectedScope && selectedScope.label || store.scope;
    }

    private get resultSentence() {
        const {totalCount, query} = this.props.store;
        const hasText = query && query.trim().length > 0;
        return (
            <span>
                <strong>{totalCount}&nbsp;</strong>
                {`résultat${totalCount > 1 ? "s" : ""} ${hasText && `pour "${query}"`}`}
            </span>
        );
    }

    render() {
        const {store, exportAction, classNames} = this.props;
        const scope = store.scope && store.scope !== "ALL" ? {scope: {
            code: store.scope,
            label: "Scope",
            value: this.scopeLabel
        }} : undefined;

        return (
            <div className={`${styles.summary} ${classNames!.summary || ""}`}>
                {exportAction ?
                    <div className={`${styles.print} ${classNames!.print || ""}`}>
                        <Button handleOnClick={exportAction} icon="print" label="result.export"  />
                    </div>
                : null}
                <span className={`${styles.sentence} ${classNames!.sentence || ""}`}>{this.resultSentence}</span>
                <span>
                    <TopicDisplayer
                        topicClickAction={this.onScopeClick}
                        topicList={!this.props.scopeLock ? scope : undefined}
                    />
                </span>
            </div>
        );
    }
}
