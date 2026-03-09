import {observable} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {useEffect} from "react";
import {useTranslation} from "react-i18next";

import {CollectionStore, FormEntityField, ServerCollectionStore, SortInput} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";
import {Button, ChipCss} from "@focus4/toolbox";

import {ChipType, SearchChip, SearchChipProps} from "./chip";

import summaryCss, {SummaryCss} from "./__style__/summary.css";

export {summaryCss};
export type {SummaryCss};

/** Props du Summary. */
export interface SummaryProps<T extends object> {
    /** Permet de supprimer le tri. Par défaut : true */
    canRemoveSort?: boolean;
    /**
     * Affiche le résultat (si non vide) de cette fonction à la place de la valeur ou de son libellé existant dans les chips.
     * @param type Le type du chip affiché (`filter` ou `facet`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`)
     * @param value La valeur du champ affiché (filtre: `field.value`, facet : `facetItem.code`)
     * @returns Le libellé à utiliser, ou `undefined` s'il faut garder le libellé existant.
     */
    chipKeyResolver?: (type: "facet" | "filter", code: string, value: unknown) => Promise<string | undefined>;
    /**
     * Passe le style retourné par cette fonction aux chips.
     * @param type Le type du chip affiché (`filter`, `facet`, `sort` ou `group`)
     * @param code Le code du champ affiché (filtre : `field.$field.label`, facet : `facetOutput.code`, sort : ``store.sort.map(({fieldName}) => fieldName).join("|")`, group : `store.groupingKey`)
     * @param values Les valeurs du champ affiché (filtre: `field.value`, facet : `facetItem.code`, inexistant pour sort en group)
     * @returns L'objet de theme, qui sera fusionné avec le theme existant.
     */
    chipThemer?: (type: ChipType, code: string, values?: unknown[]) => ChipCss;
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
    orderableColumnList?: {label: string; sort: SortInput[]}[];
    /** Store associé. */
    store: CollectionStore<T>;
    /** CSS. */
    theme?: CSSProp<SummaryCss>;
}

/**
 * Le `Summary` sert à afficher le résumé de la recherche en cours en listant, dans l'ordre :
 *
 *  - Le nombre de résultats
 *  - Le champ de recherche textuel
 *  - Les critères
 *  - Les facettes
 *  - Le groupe
 *  - Le tri
 *
 * L'ensemble de ces informations peuvent être masqués unitairement via les props `hideXXX`.
 *
 * (Note : le tri et le groupe ne sont jamais effectifs en même temps)
 */

export function Summary<T extends object>({
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
    const {t} = useTranslation();
    const theme = useTheme("summary", summaryCss, pTheme);

    const state = useLocalObservable(
        () => ({
            hideCriteria,
            orderableColumnList,
            store,

            /** Liste des filtres à afficher (inclusion). */
            get includeList() {
                const topicList: (SearchChipProps & {key: string})[] = [];

                // On ajoute la liste des critères.
                if (this.hideCriteria !== true && this.store instanceof ServerCollectionStore) {
                    for (const criteriaKey in this.store.flatCriteria) {
                        const {label, domain} = (this.store.criteria[criteriaKey] as FormEntityField).$field;
                        const value = (this.store.flatCriteria as any)[criteriaKey];
                        if (
                            (!this.hideCriteria || !this.hideCriteria.includes(criteriaKey)) &&
                            value !== undefined &&
                            (!Array.isArray(value) || value.length > 0)
                        ) {
                            topicList.push({
                                type: "filter",
                                key: `${criteriaKey}-${value as string}`,
                                code: label,
                                codeLabel: label,
                                values: [
                                    {
                                        code: value,
                                        label:
                                            typeof domain?.displayFormatter === "string"
                                                ? t(domain.displayFormatter, {value})
                                                : domain?.displayFormatter?.(value)
                                    }
                                ],
                                onDeleteClick: () => {
                                    (
                                        (this.store as ServerCollectionStore).criteria[criteriaKey] as FormEntityField
                                    ).value = undefined;
                                }
                            });
                        }
                    }
                }

                // On ajoute à la liste toutes les facettes sélectionnées.
                if (!hideFacets) {
                    for (const facetKey in this.store.inputFacets) {
                        const inputFacet = this.store.inputFacets[facetKey];
                        const facetOutput = this.store.facets.find(facet => facetKey === facet.code);
                        if (facetOutput && (!!inputFacet.selected || !!inputFacet.excluded)) {
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
                                onDeleteClick: () => this.store.removeFacetValue(facetKey)
                            });
                        }
                    }
                }

                return topicList;
            },

            /** Récupère le tri courant pour afficher le chip correspondant. */
            get currentSort() {
                const {sort} = this.store;
                if (this.orderableColumnList && sort.length > 0) {
                    return (
                        this.orderableColumnList.find(
                            o =>
                                o.sort.length === sort.length &&
                                o.sort.every(
                                    (s, i) =>
                                        s.fieldName === sort[i].fieldName &&
                                        (s.sortDesc ?? false) === (sort[i].sortDesc ?? false)
                                )
                        ) ?? null
                    );
                } else {
                    return null;
                }
            }
        }),
        {hideCriteria: observable.ref, orderableColumnList: observable.ref, store: observable.ref}
    );

    useEffect(() => {
        state.hideCriteria = hideCriteria;
        state.orderableColumnList = orderableColumnList;
        state.store = store;
    }, [hideCriteria, orderableColumnList, store]);

    return useObserver(() => {
        const {groupingKey, totalCount, query} = store;
        return (
            <div className={theme.summary()}>
                {/* Nombre de résultats. */}
                {!hideResults ? (
                    <span>
                        <strong>{totalCount}&nbsp;</strong>
                        {t(`${i18nPrefix}.search.summary.result`, {count: totalCount})}
                    </span>
                ) : null}

                {/* Texte de recherche. */}
                {!hideQuery && query && query.trim().length > 0 ? (
                    <span>{`${t(`${i18nPrefix}.search.summary.for`)} "${query}"`}</span>
                ) : null}

                {/* Liste des filtres (facettes + critères) */}
                {state.includeList.length ? (
                    <>
                        <span>{t(`${i18nPrefix}.search.summary.by`)}</span>
                        {state.includeList.map(({key, ...chip}) => (
                            <SearchChip
                                key={key}
                                {...chip}
                                className={theme.chip()}
                                deletable
                                keyResolver={chipKeyResolver}
                                themer={chipThemer}
                            />
                        ))}
                    </>
                ) : null}

                {/* Groupe. */}
                {groupingKey && !hideGroup ? (
                    <>
                        <span>{t(`${i18nPrefix}.search.summary.group`, {count: totalCount})}</span>
                        <SearchChip
                            className={theme.chip()}
                            code={groupingKey}
                            codeLabel={store.groupingLabel!}
                            deletable
                            onDeleteClick={() => (store.groupingKey = undefined)}
                            themer={chipThemer}
                            type="group"
                        />
                    </>
                ) : null}

                {/* Tri. */}
                {state.currentSort && !hideSort && !groupingKey && totalCount > 1 ? (
                    <>
                        <span>{t(`${i18nPrefix}.search.summary.sortBy`)}</span>
                        <SearchChip
                            className={theme.chip()}
                            code={state.currentSort.sort.map(({fieldName}) => fieldName).join("|")}
                            codeLabel={state.currentSort.label}
                            deletable={canRemoveSort}
                            onDeleteClick={canRemoveSort ? () => (store.sort = []) : undefined}
                            themer={chipThemer}
                            type="sort"
                        />
                    </>
                ) : null}

                {/* Action d'export. */}
                {exportAction ? (
                    <div className={theme.print()}>
                        <Button
                            icon={{i18nKey: `${i18nPrefix}.icons.summary.export`}}
                            label={t(`${i18nPrefix}.search.summary.export`)}
                            onClick={exportAction}
                            type="button"
                        />
                    </div>
                ) : null}
            </div>
        );
    });
}
