import {autobind} from "core-decorators";
import i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";

import {GroupOperationListItem, LineOperationListItem, StoreList} from "../../../list";
import {injectStyle} from "../../../theming";

import {SearchStore} from "../../store";
import {GroupResult} from "../../types";
import {ActionBar} from "../action-bar";

import {computed} from "mobx";
import * as styles from "./__style__/group.css";

export type GroupStyle = Partial<typeof styles>;

export interface Props {
    classNames?: GroupStyle & {mosaicAdd?: string};
    group: GroupResult<{}>;
    groupOperationList?: GroupOperationListItem<{}>[];
    hasSelection?: boolean;
    LineComponent?: ReactComponent<any>;
    lineProps?: {};
    lineOperationList?: (data: {}) => LineOperationListItem<{}>[];
    MosaicComponent?: ReactComponent<any>;
    perPage: number;
    showAllHandler?: (key: string) => void;
    store: SearchStore<any>;
}

@injectStyle("group")
@autobind
@observer
export class Group extends React.Component<Props, void> {

    @computed
    private get store() {
        const {group, store} = this.props;
        return group.code ? store.getSearchGroupStore(group.code) : store;
    }

    private renderList() {
        const {classNames, group, hasSelection, perPage, LineComponent, lineProps, lineOperationList, MosaicComponent, showAllHandler, store} = this.props;
        const List = StoreList as new () => StoreList<any, any>;
        return (
            <div>
                <List
                    classNames={{mosaicAdd: classNames && classNames.mosaicAdd}}
                    data={group.list}
                    hasSelection={hasSelection}
                    hideAddItemHandler={!!group.code}
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
                        {i18n.t("search.loadingMore")}
                    </div>
                : null}
            </div>
        );
    }

    render() {
        const {classNames, group, hasSelection, groupOperationList, store} = this.props;
        if (!store.groupingKey) {
            return this.renderList();
        } else if (group.code && group.label && group.totalCount) {
            return (
                <div className={`${styles.container} ${classNames!.container || ""}`}>
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
