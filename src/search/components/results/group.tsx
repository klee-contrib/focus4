import {autobind} from "core-decorators";
import i18n from "i18next";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";

import {ActionBar, ListStoreBase, OperationListItem, StoreList} from "../../../list";
import {injectStyle} from "../../../theming";

import {GroupResult} from "../../types";

import * as styles from "./style/group.css";

export type GroupStyle = Partial<typeof styles>;

export interface Props {
    classNames?: GroupStyle;
    initialRowsCount: number;
    group: GroupResult<{}>;
    hasSelection?: boolean;
    LineComponent: ReactComponent<any>;
    onLineClick?: (item: any) => void;
    operationList?: OperationListItem[];
    showAllHandler?: (key: string) => void;
    store: ListStoreBase<any>;
}

@injectStyle("group")
@autobind
@observer
export class Group extends React.Component<Props, void> {

    @observable
    private resultsDisplayedCount = this.props.initialRowsCount || 3;

    private showMoreHandler() {
        const {list} = this.props.group;
        this.resultsDisplayedCount = this.resultsDisplayedCount + 3 <= list.length ? this.resultsDisplayedCount + 3 : list.length;
    }

    private renderList() {
        const {group, hasSelection, LineComponent, onLineClick, operationList, store} = this.props;
        const listClone = group.list.slice();
        const listToRender = !group.code ? listClone : listClone.splice(0, this.resultsDisplayedCount);
        return (
            <div>
                <StoreList
                    data={listToRender as any}
                    hasSelection={hasSelection}
                    LineComponent={LineComponent}
                    lineProps={{operationList, onLineClick} as any}
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
        const {classNames, group, hasSelection, operationList, showAllHandler, store} = this.props;
        if (!group.code) {
            return this.renderList();
        } else if (group.code && group.label && group.totalCount) {
            return (
                <div className={`${styles.container} ${classNames!.container || ""}`}>
                    <ActionBar
                        group={{code: group.code, label: group.label, totalCount: group.totalCount}}
                        hasSelection={hasSelection}
                        operationList={operationList}
                        store={store}
                    />
                    {this.renderList()}
                    <div className={`${styles.actions} ${classNames!.actions || ""}`}>
                        {group.list.length > this.resultsDisplayedCount ?
                            <Button icon="add" handleOnClick={this.showMoreHandler} label={i18n.t("show.more")} />
                        : null}
                        {showAllHandler ?
                            <Button icon="arrow_forward" handleOnClick={() => showAllHandler && showAllHandler(group.code!)} label={i18n.t("show.all")} />
                        : null}
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}
