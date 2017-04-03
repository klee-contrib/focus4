import {autobind} from "core-decorators";
import i18n from "i18next";
import {omit} from "lodash";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Chips from "focus-components/chips";

import {SearchStore} from "../../store";

import {injectStyle} from "../../../theming";

import * as styles from "./style/list-summary.css";

export type SummaryStyle = Partial<typeof styles>;

export interface ListSummaryProps {
    classNames?: SummaryStyle;
    exportAction?: () => void;
    isSingleScope?: boolean;
    scopes: {code: string, label?: string}[];
    store: SearchStore;
}

/** Affiche le nombre de résultats et les filtres dans la recherche avancée. */
@injectStyle("summary")
@autobind
@observer
export class Summary extends React.Component<ListSummaryProps, void> {

    /** Liste des filtres à afficher. */
    @computed.struct
    private get filterList() {
        const {store, isSingleScope, scopes} = this.props;

        const topicList = [];

        // Si on a un scope et qu'on l'affiche, alors on ajoute le scope à la liste en premier.
        if (store.scope && store.scope !== "ALL" && !isSingleScope) {
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

        return topicList;
    }

    render() {
        const {classNames, exportAction, store} = this.props;
        const {groupingKey, totalCount, query} = store;

        const plural = totalCount > 1 ? "s" : "";
        const sentence = `${styles.sentence} ${classNames!.sentence || ""}`;

        return (
            <div className={`${styles.summary} ${classNames!.summary || ""}`}>
                <span className={sentence}>
                    <strong>{totalCount}&nbsp;</strong>{i18n.t(`search.summary.result${plural}`)}
                </span>
                {query && query.trim().length > 0 ?
                    <span className={sentence}> {`${i18n.t("search.summary.for")} "${query}"`}</span>
                : null}
                {this.filterList.length ?
                    <div className={`${styles.chips} ${classNames!.chips || ""}`}>
                        <span className={sentence}>{i18n.t("search.summary.by")}</span>
                        {this.filterList.map(chip => <Chips {...chip}/>)}
                    </div>
                : null}
                {groupingKey ?
                    <div className={`${styles.chips} ${classNames!.chips || ""}`}>
                        <span className={sentence}>{i18n.t(`search.summary.group${plural}`)}</span>
                        <Chips
                            key={groupingKey}
                            label={store.facets.find(facet => store.groupingKey === facet.code).label}
                            onDeleteClick={() => store.groupingKey = undefined}
                        />
                    </div>
                : null}
                {exportAction ?
                    <div className={`${styles.print} ${classNames!.print || ""}`}>
                        <Button handleOnClick={exportAction} icon="print" label="result.export"  />
                    </div>
                : null}
            </div>
        );
    }
}
