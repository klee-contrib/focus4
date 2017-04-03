import {autobind} from "core-decorators";
import i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";

import {ActionBar, GroupOperationListItem, LineOperationListItem, ListStoreBase, StoreList} from "../../../list";
import {injectStyle} from "../../../theming";

import {GroupResult} from "../../types";

import * as styles from "./style/group.css";

export type GroupStyle = Partial<typeof styles>;

export interface Props {
    classNames?: GroupStyle;
    group: GroupResult<{}>;
    groupOperationList?: GroupOperationListItem<{}>[];
    hasSelection?: boolean;
    LineComponent: ReactComponent<any>;
    lineProps?: {};
    lineOperationList?: (data: {}) => LineOperationListItem<{}>[];
    perPage: number;
    showAllHandler?: (key: string) => void;
    store: ListStoreBase<any>;
}

@injectStyle("group")
@autobind
@observer
export class Group extends React.Component<Props, void> {

    private renderList() {
        const {group, hasSelection, perPage, LineComponent, lineProps, lineOperationList, showAllHandler, store} = this.props;
        return (
            <div>
                <StoreList
                    data={group.list as any}
                    hasSelection={hasSelection}
                    isManualFetch={!!group.code}
                    LineComponent={LineComponent}
                    lineProps={lineProps as any}
                    operationList={lineOperationList}
                    perPage={group.code ? perPage : undefined}
                    showAllHandler={showAllHandler && group.code ? () => showAllHandler(group.code!) : undefined}
                    store={store}
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
                        store={store}
                    />
                    {this.renderList()}
                </div>
            );
        } else {
            return null;
        }
    }
}
