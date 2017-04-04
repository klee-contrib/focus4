import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import {EntityField} from "../../entity";
import {injectStyle} from "../../theming";

import {LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import {timeline} from "./style/list.css";

export interface TimelineProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    data: T[];
    dateSelector: (data: T) => EntityField<string>;
}

@injectStyle("list")
@autobind
@observer
export class Timeline<T, P extends {data?: T}> extends ListBase<T, TimelineProps<T, P>> {

    get data() {
        return this.props.data;
    }

    private renderLines() {
        const {lineClassNames, itemKey, LineComponent, lineProps, dateSelector, extraItems = [], extraItemsPosition = "after"} = this.props;
        const Line = LineWrapper as new() => LineWrapper<T, P>;

        const items = this.displayedData.map((item, idx) =>
            <Line
                key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                classNames={lineClassNames}
                data={item}
                dateSelector={dateSelector}
                LineComponent={LineComponent}
                lineProps={lineProps}
                type="timeline"
            />
        );

        if (extraItemsPosition === "after") {
            return [...items, ...extraItems];
        } else {
            return [...extraItems, ...items];
        }
    }

    render() {
        return (
            <ul className={`${timeline} ${this.props.classNames!.timeline || ""}`}>
                {this.renderLines()}
                {this.renderButtons()}
            </ul>
        );
    }
}

export function timelineFor<T, P extends {data?: T}>(props: TimelineProps<T, P>) {
    const List = Timeline as any;
    return <List {...props} />;
}
