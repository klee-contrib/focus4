import {autobind} from "core-decorators";
import i18next from "i18next";
import {omit} from "lodash";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {Button} from "react-toolbox/lib/button";
import {Chip} from "react-toolbox/lib/chip";

import {getIcon} from "../../components";
import {SearchStore} from "../store";

import * as styles from "./__style__/summary.css";

export type SummaryStyle = Partial<typeof styles>;

export interface ListSummaryProps<T> {
    /** Par défaut : true */
    canRemoveSort?: boolean;
    exportAction?: () => void;
    hideCriteria?: boolean;
    hideFacets?: boolean;
    hideScope?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    scopes: {code: string, label?: string}[];
    store: SearchStore<T>;
    theme?: SummaryStyle;
}

/** Affiche le nombre de résultats et les filtres dans la recherche avancée. */
@autobind
@observer
export class Summary<T> extends React.Component<ListSummaryProps<T>, void> {

    /** Liste des filtres à afficher. */
    @computed.struct
    protected get filterList() {
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
                    label: `${i18next.t(facetOutput && facetOutput.label || facetKey)} : ${i18next.t(facetItem && facetItem.label || facetValue)}`,
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
                    label: `${i18next.t(translationKey)} : ${domain && domain.displayFormatter && domain.displayFormatter(value) || value}`,
                    onDeleteClick: () => store.criteria[criteriaKey].value = undefined
                });
            }
        }

        return topicList;
    }

    @computed.struct
    protected get currentSort() {
        const {orderableColumnList, store} = this.props;
        if (orderableColumnList && store.sortBy) {
            return orderableColumnList.find(o => o.key === store.sortBy && o.order === store.sortAsc) || null;
        } else {
            return null;
        }
    }

    render() {
        const {canRemoveSort = true, theme, exportAction, i18nPrefix = "focus", store} = this.props;
        const {groupingKey, totalCount, query} = store;

        const plural = totalCount > 1 ? "s" : "";
        const sentence = theme!.sentence;

        return (
            <div className={theme!.summary}>
                <span className={sentence}>
                    <strong>{totalCount}&nbsp;</strong>{i18next.t(`${i18nPrefix}.search.summary.result${plural}`)}
                </span>
                {query && query.trim().length > 0 ?
                    <span className={sentence}> {`${i18next.t(`${i18nPrefix}.search.summary.for`)} "${query}"`}</span>
                : null}
                {this.filterList.length ?
                    <div className={theme!.chips}>
                        <span className={sentence}>{i18next.t(`${i18nPrefix}.search.summary.by`)}</span>
                        {this.filterList.map(chip => <Chip deletable {...chip}>{chip.label}</Chip>)}
                    </div>
                : null}
                {groupingKey ?
                    <div className={theme!.chips}>
                        <span className={sentence}>{i18next.t(`${i18nPrefix}.search.summary.group${plural}`)}</span>
                        <Chip
                            deletable
                            onDeleteClick={() => store.groupingKey = undefined}
                        >
                            {i18next.t(store.facets.find(facet => store.groupingKey === facet.code).label)}
                        </Chip>
                    </div>
                : null}
                {this.currentSort && !(groupingKey || store.scope === "ALL") && totalCount > 1 ?
                    <div className={theme!.chips}>
                        <span className={sentence}>{i18next.t(`${i18nPrefix}.search.summary.sortBy`)}</span>
                        <Chip
                            deletable={canRemoveSort}
                            onDeleteClick={canRemoveSort ? () => store.sortBy = undefined : undefined}
                        >
                        {i18next.t(this.currentSort.label)}</Chip>
                    </div>
                : null}
                {exportAction ?
                    <div className={theme!.print}>
                        <Button
                            onClick={exportAction}
                            icon={getIcon(`${i18nPrefix}.icons.summary.export`)}
                            label={`${i18nPrefix}.search.summary.export`}
                            type="button"
                        />
                    </div>
                : null}
            </div>
        );
    }
}

export default themr("summary", styles)(Summary);
