import i18next from "i18next";
import {observable} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {useEffect} from "react";

import {CollectionStore, FormEntityField} from "@focus4/stores";
import {CSSProp, getIcon, useTheme} from "@focus4/styling";
import {Button, ChipCss} from "@focus4/toolbox";

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
    chipKeyResolver?: (type: "facet" | "filter", code: string, value: string) => Promise<string | undefined>;
    /**
     * Passe le style retourné par cette fonction aux chips.
     * @param type Le type du chip affiché (`filter`, `facet`, `sort` ou `group`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`, sort : `store.sortBy`, group : `store.groupingKey`)
     * @param values Les valeurs du champ affiché (filtre: `field.value`, facet : `facetItem.code`, inexistant pour sort en group)
     * @returns L'objet de theme, qui sera fusionné avec le theme existant.
     */
    chipThemer?: (type: ChipType, code: string, values?: string[]) => ChipCss;
    /** Handler pour le bouton d'export. */
    exportAction?: () => void;
    /** Masque les critères de recherche. */
    hideCriteria?: string[] | boolean;
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

    const props = useLocalObservable(() => ({hideCriteria, orderableColumnList, store}), {
        hideCriteria: observable.ref,
        orderableColumnList: observable.ref,
        store: observable.ref
    });
    useEffect(() => {
        props.hideCriteria = hideCriteria;
        props.orderableColumnList = orderableColumnList;
        props.store = store;
    }, [hideCriteria, orderableColumnList, store]);

    const state = useLocalObservable(() => ({
        /** Liste des filtres à afficher (inclusion). */
        get includeList() {
            const topicList: (SearchChipProps & {key: string})[] = [];

            // On ajoute la liste des critères.
            if (props.hideCriteria !== true && props.store.criteria) {
                for (const criteriaKey in props.store.flatCriteria) {
                    const {label, domain} = (props.store.criteria[criteriaKey] as FormEntityField).$field;
                    const value = (props.store.flatCriteria as any)[criteriaKey];
                    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                    if (!props.hideCriteria || !props.hideCriteria.includes(criteriaKey)) {
                        topicList.push({
                            type: "filter",
                            key: `${criteriaKey}-${value as string}`,
                            code: label,
                            codeLabel: label,
                            values: [{code: value, label: domain?.displayFormatter?.(value)}],
                            onDeleteClick: () => {
                                (props.store.criteria[criteriaKey] as FormEntityField).value = undefined;
                            }
                        });
                    }
                }
            }

            // On ajoute à la liste toutes les facettes sélectionnées.
            if (!hideFacets) {
                for (const facetKey in props.store.inputFacets) {
                    const inputFacet = props.store.inputFacets[facetKey];
                    const facetOutput = props.store.facets.find(facet => facetKey === facet.code);
                    if (facetOutput && (inputFacet.selected || inputFacet.excluded)) {
                        topicList.push({
                            type: "facet",
                            key: facetKey,
                            code: facetOutput.code,
                            codeLabel: facetOutput.label,
                            valueOperator:
                                (facetOutput.isMultiValued && inputFacet.operator === "and") ||
                                (!facetOutput.isMultiValued && inputFacet.excluded?.length)
                                    ? "and"
                                    : "or",
                            values: facetOutput.values
                                .map(value => ({
                                    code: value.code,
                                    label: value.label,
                                    invert: inputFacet.selected?.find(v => v === value.code)
                                        ? false
                                        : inputFacet.excluded?.find(v => v === value.code)
                                        ? true
                                        : undefined
                                }))
                                .filter(({invert}) => invert !== undefined),
                            onDeleteClick: () => props.store.removeFacetValue(facetKey)
                        });
                    }
                }
            }

            return topicList;
        },

        /** Récupère le tri courant pour afficher le chip correspondant. */
        get currentSort() {
            if (props.orderableColumnList && props.store.sortBy) {
                return props.orderableColumnList.find(o => o.key === store.sortBy && o.order === store.sortAsc) ?? null;
            } else {
                return null;
            }
        }
    }));

    return useObserver(() => {
        const {groupingKey, totalCount, query} = store;
        return (
            <div className={theme.summary()}>
                {/* Nombre de résultats. */}
                {!hideResults ? (
                    <span className={theme.sentence()}>
                        <strong>{totalCount}&nbsp;</strong>
                        {i18next.t(`${i18nPrefix}.search.summary.result`, {count: totalCount})}
                    </span>
                ) : null}

                {/* Texte de recherche. */}
                {!hideQuery && query && query.trim().length > 0 ? (
                    <span className={theme.sentence()}>
                        {" "}
                        {`${i18next.t(`${i18nPrefix}.search.summary.for`)} "${query}"`}
                    </span>
                ) : null}

                {/* Liste des filtres (facettes + critères) */}
                {state.includeList.length ? (
                    <div className={theme.chips()}>
                        <span className={theme.sentence()}>{i18next.t(`${i18nPrefix}.search.summary.by`)}</span>
                        {state.includeList.map(chip => (
                            // eslint-disable-next-line react/jsx-key
                            <SearchChip {...chip} deletable keyResolver={chipKeyResolver} themer={chipThemer} />
                        ))}
                    </div>
                ) : null}

                {/* Groupe. */}
                {groupingKey && !hideGroup ? (
                    <div className={theme.chips()}>
                        <span className={theme.sentence()}>
                            {i18next.t(`${i18nPrefix}.search.summary.group`, {count: totalCount})}
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
                            icon={getIcon(`${i18nPrefix}.icons.summary.export`)}
                            label={`${i18nPrefix}.search.summary.export`}
                            onClick={exportAction}
                            type="button"
                        />
                    </div>
                ) : null}
            </div>
        );
    });
}
