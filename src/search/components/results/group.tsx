import {autobind} from "core-decorators";
import i18next from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {GroupOperationListItem, LineOperationListItem, LineStyle, ListStyle, MiniListStore, StoreList} from "../../../list";

import {SearchStore} from "../../store";
import {GroupResult} from "../../types";
import ActionBar from "../action-bar";

import {computed} from "mobx";
import * as styles from "./__style__/group.css";

export type GroupStyle = Partial<typeof styles>;

export interface GroupProps<T> {
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data?: T) => boolean;
    DetailComponent?: React.ComponentClass<{data: T}> | React.SFC<{data: T}>;
    detailHeight?: number | ((data: {}) => number);
    /** Component à afficher lorsque la liste est vide. Par défaut () => <div>{i18next.t("focus.list.empty")}</div> */
    EmptyComponent?: React.ComponentClass<{addItemHandler?: () => void}> | React.SFC<{addItemHandler?: () => void}>;
    group: GroupResult<{}>;
    groupOperationList?: GroupOperationListItem<T>[];
    hasSelection?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    LineComponent?: React.ComponentClass<{data?: T}> | React.SFC<{data?: T}>;
    lineOperationList?: (data: {}) => LineOperationListItem<{}>[];
    lineProps?: {};
    lineTheme?: LineStyle;
    listTheme?: ListStyle;
    MosaicComponent?: React.ComponentClass<{data?: T}> | React.SFC<{data?: T}>;
    perPage: number;
    selectionnableInitializer?: (data?: T) => boolean;
    showAllHandler?: (key: string) => void;
    store: SearchStore<T>;
    theme?: GroupStyle;
}

@autobind
@observer
export class Group<T> extends React.Component<GroupProps<T>, void> {

    @computed
    protected get store(): MiniListStore<any> {
        const {group, store} = this.props;
        return group.code ? store.getSearchGroupStore(group.code) : store;
    }

    protected renderList() {
        const {listTheme, lineTheme, group, hasSelection, i18nPrefix = "focus", perPage, LineComponent, lineProps, lineOperationList, MosaicComponent, selectionnableInitializer, showAllHandler, store, EmptyComponent, DetailComponent, detailHeight, canOpenDetail} = this.props;
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
                    lineProps={lineProps}
                    operationList={lineOperationList}
                    perPage={group.code ? perPage : undefined}
                    selectionnableInitializer={selectionnableInitializer}
                    showAllHandler={showAllHandler && group.code ? () => showAllHandler(group.code!) : undefined}
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
                <div className={theme!.container!}>
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
