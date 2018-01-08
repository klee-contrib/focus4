import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {ReactComponent} from "../../../config";
import {EntityField} from "../../../entity";

import LineWrapper, {LineProps} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";

/** Props du composant de TimeLine. */
export interface TimelineProps<T> extends ListBaseProps<T> {
    /** Les données. */
    data: T[];
    /** Le sélecteur du champ contenant la date. */
    dateSelector: (data: T) => EntityField<string>;
    /** Le composant de ligne. */
    TimelineComponent: ReactComponent<LineProps<T>>;
}

/** Composant affichant une liste sous forme de Timeline. */
@autobind
@observer
export class Timeline<T> extends ListBase<T, TimelineProps<T>> {

    get data() {
        return this.props.data;
    }

    private renderLines() {
        const {lineTheme, itemKey, TimelineComponent, dateSelector} = this.props;
        return this.displayedData.map((item, idx) =>
            <LineWrapper
                key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                theme={lineTheme}
                data={item}
                dateSelector={dateSelector}
                LineComponent={TimelineComponent}
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

const ThemedTimeline = themr("list", styles)(Timeline);
export default ThemedTimeline;

/**
 * Crée un composant affichant une liste sous forme de Timeline.
 * @param props Les props de la timeline.
 */
export function timelineFor<T>(props: TimelineProps<T>) {
    const List = ThemedTimeline as any;
    return <List {...props} />;
}
