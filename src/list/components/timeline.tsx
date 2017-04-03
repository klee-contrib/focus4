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
        const {LineComponent, lineProps, dateSelector} = this.props;
        const Line = LineWrapper as new() => LineWrapper<T, P>;
        return this.displayedData.map((line, i) =>
            <Line
                key={i}
                data={line}
                dateSelector={dateSelector}
                LineComponent={LineComponent}
                lineProps={lineProps}
            />
        );
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
