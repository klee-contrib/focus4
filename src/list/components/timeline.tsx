import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {EntityField} from "../../entity";

import {LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";

export interface TimelineProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    data: T[];
    dateSelector: (data: T) => EntityField<string>;
    TimelineComponent: React.ComponentClass<P> | React.SFC<P>;
}

@themr("list", styles)
@autobind
@observer
export class Timeline<T, P extends {data?: T}> extends ListBase<T, TimelineProps<T, P>> {

    get data() {
        return this.props.data;
    }

    private renderLines() {
        const {lineTheme, itemKey, TimelineComponent, lineProps, dateSelector} = this.props;
        const Line = LineWrapper as new() => LineWrapper<T, P>;

        return this.displayedData.map((item, idx) =>
            <Line
                key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                theme={lineTheme}
                data={item}
                dateSelector={dateSelector}
                LineComponent={TimelineComponent}
                lineProps={lineProps}
                type="timeline"
            />
        );
    }

    render() {
        return (
            <ul className={this.props.theme!.timeline}>
                {this.renderLines()}
                {this.renderBottomRow()}
            </ul>
        );
    }
}

export function timelineFor<T, P extends {data?: T}>(props: TimelineProps<T, P>) {
    const List = Timeline as any;
    return <List {...props} />;
}
