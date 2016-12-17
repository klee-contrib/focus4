import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

export interface GroupComponentProps {
    canShowMore: boolean;
    count: number;
    groupKey: string;
    groupLabel?: string;
    showAllHandler?: (groupKey: string) => void;
    showMoreHandler: () => void;
}

export type GroupComponent = ReactComponent<GroupComponentProps> ;

export interface Props {
    initialRowsCount: number;
    groupComponent: GroupComponent;
    groupKey: string;
    groupLabel?: string;
    count: number;
    isUnique?: boolean;
    showAllHandler?: (key: string) => void;
    list: any[];
    renderResultsList: (list: any[], groupKey: string, count: number, isUnique: boolean) => React.ReactElement<any>;
}

@autobind
@observer
export class GroupWrapper extends React.Component<Props, void> {

    @observable
    private resultsDisplayedCount = this.props.initialRowsCount || 3;

    private showMoreHandler() {
        this.resultsDisplayedCount = this.resultsDisplayedCount + 3 <= this.props.list.length ? this.resultsDisplayedCount + 3 : this.props.list.length;
    }

    render() {
        const {groupComponent, isUnique, list, count, groupKey, groupLabel, showAllHandler, renderResultsList} = this.props;
        const listClone = list.slice();
        const listToRender = isUnique ? listClone : listClone.splice(0, this.resultsDisplayedCount);
        const Group = groupComponent as React.ComponentClass<GroupComponentProps>;
        return (
            <Group
                canShowMore={list.length > this.resultsDisplayedCount}
                count={count}
                groupKey={groupKey}
                groupLabel={groupLabel}
                showAllHandler={showAllHandler}
                showMoreHandler={this.showMoreHandler}
            >
                {renderResultsList(listToRender, groupKey, count, isUnique || false)}
            </Group>
        );
    }
}
