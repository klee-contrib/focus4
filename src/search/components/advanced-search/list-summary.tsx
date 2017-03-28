import {autobind} from "core-decorators";
import i18n from "i18next";
import {omit} from "lodash";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";

import {TopicDisplayer} from "../../../list";
import {SearchStore} from "../../store";

import {injectStyle} from "../../../theming";

import * as styles from "./style/list-summary.css";
export type ListSummaryStyle = Partial<typeof styles>;

export interface ListSummaryProps {
    classNames?: ListSummaryStyle;
    exportAction?: () => void;
    isSingleScope?: boolean;
    scopes: {code: string, label?: string}[];
    store: SearchStore;
}

/** Affiche le nombre de résultats et les filtres dans la recherche avancée. */
@injectStyle("listSummary")
@autobind
@observer
export class ListSummary extends React.Component<ListSummaryProps, void> {

    /**
     * Handler de suppression d'un filtre (scope ou facette).
     * @param key Le code du filtre sélectionné.
     */
    private onRemoveFilter(key: string) {
        const {store: {setProperties, selectedFacets}} = this.props;
        if (key === "scope") {
            setProperties({
                groupingKey: undefined,
                scope: "ALL",
                selectedFacets: {}
            });
        } else {
            setProperties({selectedFacets: omit(selectedFacets, key) as {[facet: string]: string}});
        }
    }

    /** Liste des filtres à afficher. */
    @computed.struct
    private get filterList() {
        const {store: {selectedFacets, facets, scope}, isSingleScope, scopes} = this.props;

        const topicList: {[facet: string]: {code: string, label?: string, value: string}} = {};

        // Si on a un scope et qu'on l'affiche, alors on ajoute le scope à la liste en premier.
        if (scope && scope !== "ALL" && !isSingleScope) {
            const selectedScope = scopes.find(sc => sc.code === scope);
            topicList.scope = {
                code: scope,
                value: selectedScope && selectedScope.label || scope
            };
        }

        // On ajoute à la liste toutes les facettes sélectionnées.
        for (const facetKey in selectedFacets) {
            const facetValue = selectedFacets[facetKey];
            const resultFacet = facets.find(facet => facetKey === facet.code);
            const resultFacetValue = resultFacet && resultFacet.values.find(facet => facet.code === facetValue);
            topicList[facetKey] = {
                code: facetKey,
                label: i18n.t(`live.filter.facets.${facetKey}`),
                value: resultFacetValue && resultFacetValue.label || facetValue
            };
        }

        return topicList;
    }

    /** Affiche le nombre de résultats. */
    @computed
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
        const {classNames, exportAction} = this.props;
        return (
            <div className={`${styles.summary} ${classNames!.summary || ""}`}>
                {exportAction ?
                    <div className={`${styles.print} ${classNames!.print || ""}`}>
                        <Button handleOnClick={exportAction} icon="print" label="result.export"  />
                    </div>
                : null}
                <span className={`${styles.sentence} ${classNames!.sentence || ""}`}>{this.resultSentence}</span>
                <TopicDisplayer
                    topicClickAction={this.onRemoveFilter}
                    topicList={this.filterList}
                />
            </div>
        );
    }
}
