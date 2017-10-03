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

/** Props du ListSummary. */
export interface ListSummaryProps<T> {
    /** Permet de supprimer le tri. Par défaut : true */
    canRemoveSort?: boolean;
    /** Handler pour le bouton d'export. */
    exportAction?: () => void;
    /** Masque les critères de recherche. */
    hideCriteria?: boolean;
    /** Masque les facettes. */
    hideFacets?: boolean;
    /** Masque le groupe. */
    hideGroup?: boolean;
    /** Masque le tri. */
    hideSort?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Liste des colonnes sur lesquels on peut trier. */
    orderableColumnList?: {key: string, label: string, order: boolean}[];
    /** Store associé. */
    store: SearchStore<T>;
    /** CSS. */
    theme?: SummaryStyle;
}

/** Affiche le nombre de résultats et les filtres dans la recherche avancée. */
@autobind
@observer
export class Summary<T> extends React.Component<ListSummaryProps<T>, void> {

    /** Liste des filtres à afficher. */
    @computed.struct
    protected get filterList() {
        const {hideCriteria, hideFacets, store} = this.props;

        const topicList = [];

        // On ajoute la liste des critères.
        if (!hideCriteria) {
            for (const criteriaKey in store.flatCriteria) {
                const {translationKey, domain} = store.criteria[criteriaKey].$entity;
                const value = (store.flatCriteria as any)[criteriaKey];
                topicList.push({
                    key: criteriaKey,
                    label: `${i18next.t(translationKey)} : ${domain && domain.displayFormatter && domain.displayFormatter(value) || value}`,
                    onDeleteClick: () => { store.criteria[criteriaKey].value = undefined; }
                });
            }
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

        return topicList;
    }

    /** Récupère le tri courant pour afficher le chip correspondant. */
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
        const {canRemoveSort = true, theme, exportAction, hideGroup, hideSort, i18nPrefix = "focus", store} = this.props;
        const {groupingKey, totalCount, query} = store;

        const plural = totalCount !== 1 ? "s" : "";
        const sentence = theme!.sentence;

        return (
            <div className={theme!.summary}>

                {/* Nombre de résultats. */}
                <span className={sentence}>
                    <strong>{totalCount}&nbsp;</strong>{i18next.t(`${i18nPrefix}.search.summary.result${plural}`)}
                </span>

                {/* Texte de recherche. */}
                {query && query.trim().length > 0 ?
                    <span className={sentence}> {`${i18next.t(`${i18nPrefix}.search.summary.for`)} "${query}"`}</span>
                : null}

                {/* Liste des filtres (scope + facettes + critères) */}
                {this.filterList.length ?
                    <div className={theme!.chips}>
                        <span className={sentence}>{i18next.t(`${i18nPrefix}.search.summary.by`)}</span>
                        {this.filterList.map(chip => <Chip deletable {...chip}>{chip.label}</Chip>)}
                    </div>
                : null}

                {/* Groupe. */}
                {groupingKey && !hideGroup ?
                    <div className={theme!.chips}>
                        <span className={sentence}>{i18next.t(`${i18nPrefix}.search.summary.group${plural}`)}</span>
                        <Chip
                            deletable
                            onDeleteClick={() => store.groupingKey = undefined}
                        >
                            {i18next.t((() => {
                                const f = store.facets.find(facet => store.groupingKey === facet.code);
                                return f && f.label || "";
                            })())}
                        </Chip>
                    </div>
                : null}

                {/* Tri. */}
                {this.currentSort && !hideSort && !groupingKey && totalCount > 1 ?
                    <div className={theme!.chips}>
                        <span className={sentence}>{i18next.t(`${i18nPrefix}.search.summary.sortBy`)}</span>
                        <Chip
                            deletable={canRemoveSort}
                            onDeleteClick={canRemoveSort ? () => store.sortBy = undefined : undefined}
                        >
                        {i18next.t(this.currentSort.label)}</Chip>
                    </div>
                : null}

                {/* Action d'export. */}
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
