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
    canOpenDetail?: (data: T) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: ReactComponent<DetailProps<T>>;
    /** Hauteur du composant de détail. Par défaut : 200. */
    detailHeight?: number | ((data: T) => number);
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ReactComponent<EmptyProps<T>>;
    /** Actions de groupe par groupe (code / valeur). */
    groupOperationList?: (group: GroupResult<T>) => GroupOperationListItem<T>[];
    /** Nombre d'éléments affichés par page de groupe. Par défaut: 5 */
    groupPageSize?: number;
    /** CSS des groupes. */
    groupTheme?: GroupStyle;
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Précise si chaque élément est sélectionnable ou non. Par défaut () => true. */
    isLineSelectionnable?: (data: T) => boolean;
    /** Chargement manuel (à la place du scroll infini). */
    isManualFetch?: boolean;
    /** Composant de ligne. */
    LineComponent?: ReactComponent<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste. */
    lineOperationList?: (data: T) => LineOperationListItem<T>[];
    /** CSS des lignes. */
    lineTheme?: LineStyle;
    /** CSS de la liste. */
    listTheme?: ListStyle;
    /** Composant de mosaïque. */
    MosaicComponent?: ReactComponent<LineProps<T>>;
    /** Offset pour le scroll inifini. Par défaut : 250 */
    offset?: number;
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

    /** Gère le scroll infini. */
    protected scrollListener() {
        const {store, offset = 250, isManualFetch} = this.props;
        if (!isManualFetch && store.currentCount < store.totalCount && !store.groupingKey) {
            const el = findDOMNode(this) as HTMLElement;
            const scrollTop = window.pageYOffset;
            if (el && topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight) < offset) {
                if (!store.isLoading) {
                    store.search(true);
                }
            }
        }
    }

    /** Bouton permettant de lancer la recherche des résultats suivants, si on n'est pas en scroll infini. */
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

    /** Affiche un groupe. */
    protected renderSingleGroup(group: GroupResult<T>) {
        const {canOpenDetail, DetailComponent, detailHeight, EmptyComponent, groupOperationList, groupPageSize = 5, groupTheme, hasSelection, i18nPrefix, isLineSelectionnable, lineTheme, LineComponent, lineOperationList, listTheme, MosaicComponent, store} = this.props;
        return (
            <Group
                canOpenDetail={canOpenDetail}
                DetailComponent={DetailComponent}
                detailHeight={detailHeight}
                EmptyComponent={EmptyComponent}
                group={group}
                groupOperationList={groupOperationList && groupOperationList(group)}
                hasSelection={hasSelection}
                i18nPrefix={i18nPrefix}
                isLineSelectionnable={isLineSelectionnable}
                key={group.code}
                LineComponent={LineComponent}
                lineOperationList={lineOperationList}
                lineTheme={lineTheme}
                listTheme={listTheme}
                MosaicComponent={MosaicComponent}
                perPage={groupPageSize}
                store={store}
                theme={groupTheme}
            />
        );
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
