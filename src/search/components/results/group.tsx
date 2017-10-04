import {autobind} from "core-decorators";
import i18next from "i18next";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ReactComponent} from "../../../config";
import {DetailProps, EmptyProps, GroupOperationListItem, LineOperationListItem, LineProps, LineStyle, ListStyle, MiniListStore, StoreList} from "../../../list";

import {SearchStore} from "../../store";
import {GroupResult} from "../../types";
import ActionBar from "../action-bar";

import * as styles from "./__style__/group.css";

export type GroupStyle = Partial<typeof styles>;

/** Props du composant de groupe. */
export interface GroupProps<T> {
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data: T) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: ReactComponent<DetailProps<T>>;
    /** Hauteur du composant de détail. Par défaut : 200. */
    detailHeight?: number | ((data: T) => number);
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ReactComponent<EmptyProps<T>>;
    /** Constituion du groupe à afficher. */
    group: GroupResult<T>;
    /** Actions de groupe. */
    groupOperationList?: GroupOperationListItem<T>[];
    /** Affiche la sélection sur l'ActionBar et les lignes. */
    hasSelection?: boolean;
    /** Préfixe i18n pour les libellés. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Précise si chaque élément est sélectionnable ou non. Par défaut () => true. */
    isLineSelectionnable?: (data: T) => boolean;
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
    /** Nombre d'éléments par page, ne pagine pas si non renseigné. */
    perPage: number;
    /** Store contenant la liste. */
    store: SearchStore<T>;
    /** CSS */
    theme?: GroupStyle;
}

/** Composant de groupe, affiche une ActionBar (si plusieurs groupes) et une StoreList. */
@autobind
@observer
export class Group<T> extends React.Component<GroupProps<T>, void> {

    @computed
    protected get store(): MiniListStore<any> {
        const {group, store} = this.props;
        return group.code ? store.getSearchGroupStore(group.code) : store;
    }

    /** Action pour dégrouper et sélectionner la facette correspondant au groupe choisi. */
    protected showAllHandler(value: string) {
        const {groupingKey, selectedFacets, setProperties} = this.props.store;
        setProperties({
            groupingKey: undefined,
            selectedFacets: {...selectedFacets, [groupingKey!]: value}
        });
    }

    protected renderList() {
        const {listTheme, lineTheme, group, hasSelection, i18nPrefix = "focus", perPage, LineComponent, lineOperationList, MosaicComponent, isLineSelectionnable, store, EmptyComponent, DetailComponent, detailHeight, canOpenDetail} = this.props;
        return (
            <div>
                <StoreList
                    canOpenDetail={canOpenDetail}
                    data={group.list}
                    detailHeight={detailHeight}
                    DetailComponent={DetailComponent}
                    EmptyComponent={EmptyComponent}
                    hasSelection={hasSelection}
                    hideAdditionalItems={!!group.code}
                    i18nPrefix={i18nPrefix}
                    isManualFetch={!!group.code}
                    LineComponent={LineComponent}
                    lineTheme={lineTheme}
                    MosaicComponent={MosaicComponent}
                    operationList={lineOperationList}
                    perPage={group.code ? perPage : undefined}
                    isLineSelectionnable={isLineSelectionnable}
                    showAllHandler={group.code ? () => this.showAllHandler(group.code!) : undefined}
                    store={this.store}
                    theme={listTheme}
                />
                {store.isLoading ?
                    <div style={{padding: "15px"}}>
                        {i18next.t(`${i18nPrefix}.search.loading`)}
                    </div>
                : null}
            </div>
        );
    }

    render() {
        const {theme, group, hasSelection, groupOperationList, store} = this.props;
        if (!store.groupingKey) {
            return this.renderList();
        } else if (group.code && group.label && group.totalCount) {
            return (
                <div className={theme!.container}>
                    <ActionBar
                        group={{code: group.code, label: group.label, totalCount: group.totalCount}}
                        hasSelection={hasSelection}
                        operationList={groupOperationList}
                        store={this.store}
                    />
                    {this.renderList()}
                </div>
            );
        } else {
            return null;
        }
    }
}

export default themr("group", styles)(Group);
