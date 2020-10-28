import i18next from "i18next";
import {useAsObservableSource, useLocalStore, useObserver} from "mobx-react";
import * as React from "react";

import {CollectionStore, FormEntityField} from "@focus4/stores";
import {CSSProp, getIcon, useTheme} from "@focus4/styling";
import {Button, ChipTheme} from "@focus4/toolbox";

import {ChipType, SearchChip, SearchChipProps} from "./chip";

import summaryCss, {SummaryCss} from "./__style__/summary.css";
export {summaryCss, SummaryCss};

/** Props du Summary. */
export interface SummaryProps<T> {
    /** Permet de supprimer le tri. Par défaut : true */
    canRemoveSort?: boolean;
    /**
     * Affiche le résultat (si non vide) de cette fonction à la place de la valeur ou de son libellé existant dans les chips.
     * @param type Le type du chip affiché (`filter` ou `facet`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`)
     * @param value La valeur du champ affiché (filtre: `field.value`, facet : `facetItem.code`)
     * @returns Le libellé à utiliser, ou `undefined` s'il faut garder le libellé existant.
     */
    chipKeyResolver?: (type: "filter" | "facet", code: string, value: string) => Promise<string | undefined>;
    /**
     * Passe le style retourné par cette fonction aux chips.
     * @param type Le type du chip affiché (`filter`, `facet`, `sort` ou `group`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`, sort : `store.sortBy`, group : `store.groupingKey`)
     * @param value La valeur du champ affiché (filtre: `field.value`, facet : `facetItem.code`, inexistant pour sort en group)
     * @returns L'objet de theme, qui sera fusionné avec le theme existant.
     */
    chipThemer?: (type: ChipType, code: string, value?: string) => ChipTheme;
    /** Handler pour le bouton d'export. */
    exportAction?: () => void;
    /** Masque les critères de recherche. */
    hideCriteria?: boolean;
    /** Masque les facettes. */
    hideFacets?: boolean;
    /** Masque le groupe. */
    hideGroup?: boolean;
    /** Masque la requête. */
    hideQuery?: boolean;
    /** Masque le nombre de résultats. */
    hideResults?: boolean;
    /** Masque le tri. */
    hideSort?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Liste des colonnes sur lesquels on peut trier. */
    orderableColumnList?: {key: string; label: string; order: boolean}[];
    /** Store associé. */
    store: CollectionStore<T>;
    /** CSS. */
    theme?: CSSProp<SummaryCss>;
}

/** Affiche le nombre de résultats et les filtres dans la recherche avancée. */

export function Summary<T>({
    canRemoveSort = true,
    chipKeyResolver,
    chipThemer,
    exportAction,
    hideCriteria,
    hideFacets,
    hideGroup,
    hideQuery,
    hideResults,
    hideSort,
    i18nPrefix = "focus",
    orderableColumnList,
    store,
    theme: pTheme
}: SummaryProps<T>) {
    const theme = useTheme("summary", summaryCss, pTheme);
    const props = useAsObservableSource({hideCriteria, orderableColumnList, store});
    const state = useLocalStore(() => ({
        /** Liste des filtres à afficher. */
        get filterList() {
            const topicList: (SearchChipProps & {key: string})[] = [];

            // On ajoute la liste des critères.
            if (!props.hideCriteria && props.store.criteria) {
                for (const criteriaKey in props.store.flatCriteria) {
                    const {label, domain} = (props.store.criteria[criteriaKey] as FormEntityField).$field;
                    const value = (props.store.flatCriteria as any)[criteriaKey];
                    topicList.push({
                        type: "filter",
                        key: `${criteriaKey}-${value}`,
                        code: label,
                        codeLabel: label,
                        value,
                        valueLabel: domain && domain.displayFormatter && domain.displayFormatter(value),
                        onDeleteClick: () => {
                            (props.store.criteria![criteriaKey] as FormEntityField).value = undefined;
                        }
                    });
                }
            }

            // On ajoute à la liste toutes les facettes sélectionnées.
            if (!hideFacets) {
                for (const facetKey in props.store.inputFacets) {
                    const facetValues = props.store.inputFacets[facetKey]?.selected ?? [];
                    const facetOutput = props.store.facets.find(facet => facetKey === facet.code);
                    if (facetOutput) {
                        facetOutput.values
                            .filter(value => !!facetValues.find(v => v === value.code))
                            .forEach(facetItem =>
                                topicList.push({
                                    type: "facet",
                                    key: `${facetKey}-${facetItem.code}`,
                                    code: facetOutput.code,
                                    codeLabel: facetOutput.label,
                                    value: facetItem.code,
                                    valueLabel: facetItem.label,
                                    onDeleteClick: () => props.store.removeFacetValue(facetKey, facetItem.code)
                                })
                            );
                    }
                }
            }

            return topicList;
        },

        /** Récupère le tri courant pour afficher le chip correspondant. */
        get currentSort() {
            if (props.orderableColumnList && props.store.sortBy) {
                return props.orderableColumnList.find(o => o.key === store.sortBy && o.order === store.sortAsc) || null;
            } else {
                return null;
            }
        }
    }));

    return useObserver(() => {
        const {groupingKey, totalCount, query} = store;
        const plural = totalCount !== 1 ? "s" : "";
        return (
            <div className={theme.summary()}>
                {/* Nombre de résultats. */}
                {!hideResults ? (
                    <span className={theme.sentence()}>
                        <strong>{totalCount}&nbsp;</strong>
                        {i18next.t(`${i18nPrefix}.search.summary.result${plural}`)}
                    </span>
                ) : null}

                {/* Texte de recherche. */}
                {!hideQuery && query && query.trim().length > 0 ? (
                    <span className={theme.sentence()}>
                        {" "}
                        {`${i18next.t(`${i18nPrefix}.search.summary.for`)} "${query}"`}
                    </span>
                ) : null}

                {/* Liste des filtres (scope + facettes + critères) */}
                {state.filterList.length ? (
                    <div className={theme.chips()}>
                        <span className={theme.sentence()}>{i18next.t(`${i18nPrefix}.search.summary.by`)}</span>
                        {state.filterList.map(chip => (
                            <SearchChip
                                {...chip}
                                deletable
                                keyResolver={chipKeyResolver}
                                showCode
                                themer={chipThemer}
                            />
                        ))}
                    </div>
                ) : null}

                {/* Groupe. */}
                {groupingKey && !hideGroup ? (
                    <div className={theme.chips()}>
                        <span className={theme.sentence()}>
                            {i18next.t(`${i18nPrefix}.search.summary.group${plural}`)}
                        </span>
                        <SearchChip
                            code={groupingKey}
                            codeLabel={store.groupingLabel!}
                            deletable
                            onDeleteClick={() => (store.groupingKey = undefined)}
                            themer={chipThemer}
                            type="group"
                        />
                    </div>
                ) : null}

                {/* Tri. */}
                {state.currentSort && !hideSort && !groupingKey && totalCount > 1 ? (
                    <div className={theme.chips()}>
                        <span className={theme.sentence()}>{i18next.t(`${i18nPrefix}.search.summary.sortBy`)}</span>
                        <SearchChip
                            code={state.currentSort.key}
                            codeLabel={state.currentSort.label}
                            deletable={canRemoveSort}
                            onDeleteClick={canRemoveSort ? () => (store.sortBy = undefined) : undefined}
                            themer={chipThemer}
                            type="sort"
                        />
                    </div>
                ) : null}

                {/* Action d'export. */}
                {exportAction ? (
                    <div className={theme.print()}>
                        <Button
                            onClick={exportAction}
                            icon={getIcon(`${i18nPrefix}.icons.summary.export`)}
                            label={`${i18nPrefix}.search.summary.export`}
                            type="button"
                        />
                    </div>
                ) : null}
            </div>
        );
    });
}
