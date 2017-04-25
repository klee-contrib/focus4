import {autobind} from "core-decorators";
import i18n from "i18next";
import {omit} from "lodash";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Chips from "focus-components/chips";

import {injectStyle} from "../../theming";

import {SearchStore} from "../store";

import * as styles from "./__style__/summary.css";

export type SummaryStyle = Partial<typeof styles>;

export interface ListSummaryProps {
    /** Par défaut : true */
    canRemoveSort?: boolean;
    classNames?: SummaryStyle;
    exportAction?: () => void;
    hideCriteria?: boolean;
    hideFacets?: boolean;
    hideScope?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    scopes: {code: string, label?: string}[];
    store: SearchStore<any>;
}

/** Affiche le nombre de résultats et les filtres dans la recherche avancée. */
@injectStyle("summary")
@autobind
@observer
export class Summary extends React.Component<ListSummaryProps, void> {

    /** Liste des filtres à afficher. */
    @computed.struct
    private get filterList() {
        const {hideCriteria, hideFacets, hideScope, scopes, store} = this.props;

        const topicList = [];

        // Si on a un scope et qu'on l'affiche, alors on ajoute le scope à la liste en premier.
        if (store.scope && store.scope !== "ALL" && !hideScope) {
            const selectedScope = scopes.find(sc => sc.code === store.scope);
            topicList.push({
                key: store.scope,
                label: selectedScope && selectedScope.label || store.scope,
                onDeleteClick: () => store.setProperties({
                    groupingKey: undefined,
                    scope: "ALL",
                    selectedFacets: {}
                })
            });
        }

        // On ajoute à la liste toutes les facettes sélectionnées.
        if (!hideFacets) {
            for (const facetKey in store.selectedFacets) {
                const facetValue = store.selectedFacets[facetKey];
                const facetOutput = store.facets.find(facet => facetKey === facet.code);
                const facetItem = facetOutput && facetOutput.values.find(facet => facet.code === facetValue);
                topicList.push({
                    key: facetKey,
                    label: `${i18n.t(facetOutput.label)}: ${facetItem && facetItem.label || facetValue}`,
                    onDeleteClick: () => store.setProperties({
                        selectedFacets: omit(store.selectedFacets, facetKey) as {[facet: string]: string}
                    })
                });
            }
        }

        // On ajoute la liste des critères.
        if (!hideCriteria) {
            for (const criteriaKey in store.flatCriteria) {
                const {translationKey, domain} = store.criteria[criteriaKey].$entity;
                const value = (store.flatCriteria as any)[criteriaKey];
                topicList.push({
                    key: criteriaKey,
                    label: `${i18n.t(translationKey)} : ${domain && domain.formatter && domain.formatter(value) || value}`,
                    onDeleteClick: () => store.criteria[criteriaKey].value = undefined
                });
            }
        }

        return topicList;
    }

    @computed.struct
    get currentSort() {
        const {orderableColumnList, store} = this.props;
        if (orderableColumnList && store.sortBy) {
            return orderableColumnList.find(o => o.key === store.sortBy && o.order === store.sortAsc) || null;
        } else {
            return null;
        }
    }

    render() {
        const {canRemoveSort = true, classNames, exportAction, i18nPrefix = "focus", store} = this.props;
        const {groupingKey, totalCount, query} = store;

        const plural = totalCount > 1 ? "s" : "";
        const sentence = `${styles.sentence} ${classNames!.sentence || ""}`;

        return (
            <div className={`${styles.summary} ${classNames!.summary || ""}`}>
                <span className={sentence}>
                    <strong>{totalCount}&nbsp;</strong>{i18n.t(`${i18nPrefix}.search.summary.result${plural}`)}
                </span>
                {query && query.trim().length > 0 ?
                    <span className={sentence}> {`${i18n.t(`${i18nPrefix}.search.summary.for`)} "${query}"`}</span>
                : null}
                {this.filterList.length ?
                    <div className={`${styles.chips} ${classNames!.chips || ""}`}>
                        <span className={sentence}>{i18n.t(`${i18nPrefix}.search.summary.by`)}</span>
                        {this.filterList.map(chip => <Chips {...chip}/>)}
                    </div>
                : null}
                {groupingKey ?
                    <div className={`${styles.chips} ${classNames!.chips || ""}`}>
                        <span className={sentence}>{i18n.t(`${i18nPrefix}.search.summary.group${plural}`)}</span>
                        <Chips
                            label={i18n.t(store.facets.find(facet => store.groupingKey === facet.code).label)}
                            onDeleteClick={() => store.groupingKey = undefined}
                        />
                    </div>
                : null}
                {this.currentSort && !groupingKey && totalCount > 1 ?
                    <div className={`${styles.chips} ${classNames!.chips || ""}`}>
                        <span className={sentence}>{i18n.t(`${i18nPrefix}.search.summary.sortBy`)}</span>
                        <Chips
                            label={i18n.t(this.currentSort.label)}
                            onDeleteClick={canRemoveSort ? () => store.sortBy = undefined : undefined}
                        />
                    </div>
                : null}
                {exportAction ?
                    <div className={`${styles.print} ${classNames!.print || ""}`}>
                        <Button handleOnClick={exportAction} icon="print" label={`${i18nPrefix}.search.summary.export`}  />
                    </div>
                : null}
            </div>
        );
    }
}
