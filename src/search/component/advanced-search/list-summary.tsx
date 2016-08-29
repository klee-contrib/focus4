import {autobind} from "core-decorators";
import {isArray} from "lodash";
import * as React from "react";

import {ComponentWithStore} from "../../../component/component-with-store";
import * as defaults from "../../../defaults";

export interface Props {
    totalCount: number;
    query: string;
    action: {updateProperties: Function};
    scope: string;
    scopeLock: boolean;
    exportAction?: () => void;
}

@autobind
export class ListSummary extends ComponentWithStore<Props, {}, {}> {
    static defaultProps = {
        totalCount: 0,
        query: ""
    };

    constructor(props: Props) {
        super({props, referenceNames: ["scopes"]});
    }

    private onScopeClick() {
        this.props.action.updateProperties({
            scope: "ALL",
            selectedFacets: {},
            groupingKey: undefined
        });
    }

    private get scopeLabel() {
        if (isArray(this.state.reference!["scopes"])) {
            const selectedScope = this.state.reference!["scopes"].find(scope =>
                scope["code"] === this.props.scope
            );
            return selectedScope && selectedScope["label"] || this.props.scope;
        }

        return this.props.scope;
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
