import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";

import {EntityField, textFor} from "../../entity";
import {injectStyle} from "../../theming";

import {LineProps} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./style/line.css";
import {timeline} from "./style/list.css";

export interface TimelineProps<T, P extends LineProps<T>> extends ListBaseProps<T, P> {
    data: T[];
    dateSelector: (data: T) => EntityField<string>;
}

function lineTimeline(key: number, component: React.ReactElement<any>, dateField: EntityField<string>) {
    return React.createElement(injectStyle("line", ({classNames}: {classNames?: typeof styles}) => (
        <li>
            <div className={`${styles.timelineDate} ${classNames!.timelineDate || ""}`}>{textFor(dateField)}</div>
            <div className={`${styles.timelineBadge} ${classNames!.timelineBadge || ""}`}></div>
            <div className={`${styles.timelinePanel} ${classNames!.timelinePanel || ""}`}>
                {component}
            </div>
        </li>
    )), {key});
}

@injectStyle("list")
@autobind
@observer
export class Timeline<T, P extends LineProps<T>> extends ListBase<T, TimelineProps<T, P>> {

    get data() {
        return this.props.data;
    }

    private renderLines() {
        const {LineComponent, lineProps, dateSelector} = this.props;
        return this.displayedData.map((line, i) =>
            lineTimeline(
                i,
                <LineComponent
                    data={line}
                    {...lineProps}
                />,
                dateSelector(line)
            )
        );
    }

    render() {
        return (
            <ul className={`${timeline} ${this.props.classNames!.timeline || ""}`}>
                {this.renderLines()}
                {this.renderManualFetch()}
            </ul>
        );
    }
}

export function timelineFor<T, P extends LineProps<T>>(props: TimelineProps<T, P>) {
    const List = Timeline as any;
    return <List {...props} />;
}
