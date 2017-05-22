import {autobind} from "core-decorators";
import i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {GroupOperationListItem, LineOperationListItem, StoreList} from "../../../list";

import {SearchStore} from "../../store";
import {GroupResult} from "../../types";
import {ActionBar} from "../action-bar";

import {computed} from "mobx";
import * as styles from "./__style__/group.css";

export type GroupStyle = Partial<typeof styles>;

export interface Props {
    DetailComponent?: React.ComponentClass<any> | React.SFC<any>;
    detailHeight?: number | ((data: {}) => number);
    group: GroupResult<{}>;
    groupOperationList?: GroupOperationListItem<{}>[];
    hasSelection?: boolean;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    LineComponent?: React.ComponentClass<any> | React.SFC<any>;
    lineProps?: {};
    lineOperationList?: (data: {}) => LineOperationListItem<{}>[];
    MosaicComponent?: React.ComponentClass<any> | React.SFC<any>;
    perPage: number;
    showAllHandler?: (key: string) => void;
    store: SearchStore<any>;
    theme?: GroupStyle & {mosaicAdd?: string};
}

@themr("group", styles)
@autobind
@observer
export class Group extends React.Component<Props, void> {

    @computed
    private get store() {
        const {group, store} = this.props;
        return group.code ? store.getSearchGroupStore(group.code) : store;
    }

    private renderList() {
        const {theme, group, hasSelection, i18nPrefix = "focus", perPage, LineComponent, lineProps, lineOperationList, MosaicComponent, showAllHandler, store, DetailComponent, detailHeight} = this.props;
        const List = StoreList as new () => StoreList<any, any>;
        return (
            <div>
                <List
                    theme={{mosaicAdd: theme && theme.mosaicAdd}}
                    data={group.list}
                    detailHeight={detailHeight}
                    DetailComponent={DetailComponent}
                    hasSelection={hasSelection}
                    hideAddItemHandler={!!group.code}
                    i18nPrefix={i18nPrefix}
                    isManualFetch={!!group.code}
                    LineComponent={LineComponent}
                    MosaicComponent={MosaicComponent}
                    lineProps={lineProps}
                    operationList={lineOperationList}
                    perPage={group.code ? perPage : undefined}
                    showAllHandler={showAllHandler && group.code ? () => showAllHandler(group.code!) : undefined}
                    store={this.store}
                />
                {store.isLoading ?
                    <div style={{padding: "15px"}}>
                        {i18n.t(`${i18nPrefix}.search.loading`)}
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
