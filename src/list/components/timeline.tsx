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

interface LineTimelineProps<T, P extends LineProps<T>> {
    classNames?: Partial<typeof styles>;
    data: T;
    dateSelector: (data: T) => EntityField<string>;
    LineComponent: ReactComponent<P>;
    lineProps?: P;
}

const LineTimeline = injectStyle("line", ({classNames, data, dateSelector, LineComponent, lineProps}: LineTimelineProps<any, any>) => (
    <li>
        <div className={`${styles.timelineDate} ${classNames!.timelineDate || ""}`}>{textFor(dateSelector(data))}</div>
        <div className={`${styles.timelineBadge} ${classNames!.timelineBadge || ""}`}></div>
        <div className={`${styles.timelinePanel} ${classNames!.timelinePanel || ""}`}>
            <LineComponent data={data} {...lineProps} />
        </div>
    </li>
));

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
            <LineTimeline
                key={i}
                classNames={lineProps && lineProps.classNames}
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

export function timelineFor<T, P extends LineProps<T>>(props: TimelineProps<T, P>) {
    const List = Timeline as any;
    return <List {...props} />;
}
