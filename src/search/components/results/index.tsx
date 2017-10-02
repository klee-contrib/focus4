import {autobind} from "core-decorators";
import i18next from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";
import {Button} from "react-toolbox/lib/button";

import {getIcon} from "../../../components";
import {ReactComponent} from "../../../config";
import {DetailProps, EmptyProps, GroupOperationListItem, LineOperationListItem, LineProps, LineStyle, ListStyle} from "../../../list";

import {SearchStore} from "../../store";
import {GroupResult} from "../../types";
import Group, {GroupStyle} from "./group";
export {GroupStyle};

import {bottomRow} from "../../../list/components/__style__/list.css";

/** Props de Results. */
export interface ResultsProps<T> {
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data?: T) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: ReactComponent<DetailProps<T>>;
    /** Hauteur du composant de détail. Par défaut : 200. */
    detailHeight?: number | ((data: T) => number);
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ReactComponent<EmptyProps<T>>;
    /** Actions de groupe par scope. */
    groupOperationLists?: {[scope: string]: GroupOperationListItem<T>[]};
    /** Nombre d'éléments affichés par page de groupe. Par défaut: 5 */
    groupPageSize?: number;
    /** CSS des groupes. */
    groupTheme?: GroupStyle;
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Précise si chaque élément est sélectionnable ou non. Par défaut () => true. */
    isLineSelectionnable?: (data?: T) => boolean;
    /** Chargement manuel (à la place du scroll infini). */
    isManualFetch?: boolean;
    /** Composants de ligne par scope. */
    lineComponents?: {[scope: string]: ReactComponent<LineProps<T>>};
    /** La liste des actions sur chaque élément de la liste, par scope. */
    lineOperationLists?: {[scope: string]: (data: {}) => LineOperationListItem<T>[]};
    /** CSS des lignes. */
    lineTheme?: LineStyle;
    /** CSS de la liste. */
    listTheme?: ListStyle;
    /** Composants de mosaïque par scope. */
    mosaicComponents?: {[scope: string]: ReactComponent<LineProps<T>>};
    /** Offset pour le scroll inifini. Par défaut : 250 */
    offset?: number;
    /** Nom de la facette de scope. Par défaut : FCT_SCOPE */
    scopeFacetKey?: string;
    /** Store de recherche. */
    store: SearchStore<T>;
}

/** Composants affichant les résultats de recherche, avec affiche par groupe. */
@autobind
@observer
export class Results<T> extends React.Component<ResultsProps<T>, void> {

    componentDidMount() {
        window.addEventListener("scroll", this.scrollListener);
        window.addEventListener("resize", this.scrollListener);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollListener);
        window.removeEventListener("resize", this.scrollListener);
    }

    protected scrollListener() {
        const {store, offset = 250, isManualFetch} = this.props;
        if (!isManualFetch && store.currentCount < store.totalCount && !(store.groupingKey || store.scope === "ALL")) {
            const el = findDOMNode(this) as HTMLElement;
            const scrollTop = window.pageYOffset;
            if (el && topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight) < offset) {
                if (!store.isLoading) {
                    store.search(true);
                }
            }
        }
    }

    protected get showMoreButton() {
        const {store, isManualFetch, i18nPrefix = "focus"} = this.props;
        if (isManualFetch && store.currentCount < store.totalCount && !store.groupingKey) {
            return (
                <div className={bottomRow}>
                    <Button
                        onClick={() => !store.isLoading && store.search(true)}
                        icon={getIcon(`${i18nPrefix}.icons.list.add`)}
                        label={`${i18next.t(`${i18nPrefix}.list.show.more`)}`}
                    />
                </div>
            );
        }

        return null;
    }

    protected renderSingleGroup(group: GroupResult<{}>) {
        const {lineTheme, listTheme, groupTheme, groupOperationLists = {}, groupPageSize = 5, hasSelection, i18nPrefix, lineComponents, mosaicComponents, isLineSelectionnable, lineOperationLists = {}, store, EmptyComponent, DetailComponent, detailHeight, canOpenDetail} = this.props;
        const groupKey = store.scope === "ALL" && group.code ? group.code : store.scope;
        const LineComponent = lineComponents && lineComponents[groupKey];
        const MosaicComponent = mosaicComponents && mosaicComponents[groupKey];
        if (LineComponent || MosaicComponent) {
            return (
                <Group
                    canOpenDetail={canOpenDetail}
                    DetailComponent={DetailComponent}
                    detailHeight={detailHeight}
                    EmptyComponent={EmptyComponent}
                    group={group}
                    groupOperationList={groupOperationLists[groupKey]}
                    hasSelection={hasSelection}
                    i18nPrefix={i18nPrefix}
                    isLineSelectionnable={isLineSelectionnable}
                    key={group.code}
                    LineComponent={LineComponent}
                    lineOperationList={lineOperationLists[groupKey]}
                    lineTheme={lineTheme}
                    listTheme={listTheme}
                    MosaicComponent={MosaicComponent}
                    perPage={groupPageSize}
                    showAllHandler={this.showAllHandler}
                    store={store}
                    theme={groupTheme}
                />
            );
        } else {
            return null;
        }
    }

    protected showAllHandler(key: string) {
        const {store, scopeFacetKey = "FCT_SCOPE"} = this.props;
        if (store.facets.find(facet => facet.code === scopeFacetKey)) {
            this.scopeSelectionHandler(key);
        } else {
            this.facetSelectionHandler(store.groupingKey!, key);
        }
    }

    protected scopeSelectionHandler(scope: string) {
        this.props.store.setProperties({scope});
    }

    protected facetSelectionHandler(key: string, value: string) {
        const {selectedFacets, setProperties} = this.props.store;
        setProperties({
            groupingKey: undefined,
            selectedFacets: {...selectedFacets, [key]: value}
        });
    }

    render() {
        const {results} = this.props.store;

        // result.totalCount pour une liste seule est undefined, donc il est bien gardé.
        const filteredResults = results.filter(result => result.totalCount !== 0);

        if (!filteredResults.length) {
            return null;
        } else if (filteredResults.length === 1) {
            return (
                <div>
                    {this.renderSingleGroup(filteredResults[0])}
                    {this.showMoreButton}
                </div>
            );
        } else {
            return <div>{filteredResults.map(this.renderSingleGroup)}</div>;
        }
    }
}

export default Results;

function topOfElement(element: HTMLElement): number {
    if (!element) {
        return 0;
    }
    return element.offsetTop + topOfElement((element.offsetParent as HTMLElement));
}
