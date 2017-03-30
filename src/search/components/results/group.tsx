import {autobind} from "core-decorators";
import i18n from "i18next";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";

import {ListStoreBase, OperationListItem, StoreList} from "../../../list";
import {injectStyle} from "../../../theming";

import * as styles from "./style/group.css";

export type GroupStyle = Partial<typeof styles>;

export interface Props {
    classNames?: GroupStyle;
    count: number;
    initialRowsCount: number;
    groupKey: string;
    groupLabel?: string;
    hasSelection?: boolean;
    isUnique?: boolean;
    LineComponent: ReactComponent<any>;
    lineClickHandler?: (item: any) => void;
    lineOperationList?: OperationListItem[];
    list: any[];
    showAllHandler?: (key: string) => void;
    store: ListStoreBase<any>;
}

@injectStyle("group")
@autobind
@observer
export class GroupWrapper extends React.Component<Props, void> {

    @observable
    private resultsDisplayedCount = this.props.initialRowsCount || 3;

    private showMoreHandler() {
        this.resultsDisplayedCount = this.resultsDisplayedCount + 3 <= this.props.list.length ? this.resultsDisplayedCount + 3 : this.props.list.length;
    }

    private renderList() {
        const {hasSelection, isUnique, LineComponent, lineClickHandler, lineOperationList, list, store} = this.props;
        const listClone = list.slice();
        const listToRender = isUnique ? listClone : listClone.splice(0, this.resultsDisplayedCount);
        return (
            <div>
                <StoreList
                    data={listToRender}
                    hasSelection={hasSelection}
                    LineComponent={LineComponent}
                    lineProps={{operationList: lineOperationList, onLineClick: lineClickHandler} as any}
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
        const {classNames, count, groupKey, groupLabel, isUnique, list, showAllHandler} = this.props;
        if (isUnique) {
            return this.renderList();
        } else {
            return (
                <div className={`${styles.container} ${classNames!.container || ""}`}>
                    <h3>{`${groupLabel} (${count})`}</h3>
                    {this.renderList()}
                    <div className={`${styles.actions} ${classNames!.actions || ""}`}>
                        {list.length > this.resultsDisplayedCount ?
                            <Button icon="add" handleOnClick={this.showMoreHandler} label={i18n.t("show.more")} />
                        : null}
                        {showAllHandler ?
                            <Button icon="arrow_forward" handleOnClick={() => showAllHandler && showAllHandler(groupKey)} label={i18n.t("show.all")} />
                        : null}
                    </div>
                </div>
            );
        }
    }
}
