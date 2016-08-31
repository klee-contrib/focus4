import {autobind} from "core-decorators";
import * as React from "react";

import * as defaults from "../../../defaults";

export interface Props {
    totalCount: number;
    query: string;
    action: {updateProperties: Function};
    scope: string;
    scopes: {code: string, label: string}[];
    scopeLock: boolean;
    exportAction?: () => void;
}

@autobind
export class ListSummary extends React.Component<Props, {}> {
    static defaultProps = {
        totalCount: 0,
        query: ""
    };

    private onScopeClick() {
        this.props.action.updateProperties({
            scope: "ALL",
            selectedFacets: {},
            groupingKey: undefined
        });
    }

    private get scopeLabel() {
        const {scope, scopes} = this.props;
        const selectedScope = scopes.find(sc => sc.code === scope);
        return selectedScope && selectedScope.label || scope;
}

    private get resultSentence() {
        const {totalCount, query} = this.props;
        const hasText = query && query.trim().length > 0;
        return (
            <span>
                <strong>{totalCount}&nbsp;</strong>
                {`résultat${totalCount > 1 ? "s" : ""} ${hasText && `pour "${query}"`}`}
            </span>
        );
    }

    render() {
        const {TopicDisplayer, Button} = defaults;
        if (!TopicDisplayer || !Button) {
            throw new Error("Les composants Button ou TopicDisplayer n'ont pas été définis. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts.");
        }

        const scope = this.props.scope && this.props.scope !== "ALL" ? {scope: {
            code: this.props.scope,
            label: "Scope",
            value: this.scopeLabel
        }} : undefined;

        return (
            <div data-focus="list-summary">
                {this.props.exportAction &&
                    <div className="print">
                        <Button handleOnClick={this.props.exportAction} icon="print" label="result.export" shape={null} />
                    </div>
                }
                <span className="sentence">{this.resultSentence}</span>
                <span className="topics">
                    <TopicDisplayer
                        topicClickAction={this.onScopeClick}
                        topicList={!this.props.scopeLock ? scope : undefined}
                    />
                </span>
            </div>
        );
    }
}
