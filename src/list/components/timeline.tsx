import {autobind} from "core-decorators";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {EntityField} from "../../entity";

import LineWrapper from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";

/** Props du composant de TimeLine. */
export interface TimelineProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    /** Les données. */
    data: T[];
    /** Le sélecteur du champ contenant la date. */
    dateSelector: (data: T) => EntityField<string>;
    /** Le composant de ligne. */
    TimelineComponent: React.ComponentClass<P> | React.SFC<P>;
}

/** Composant affichant une liste sous forme de Timeline. */
@autobind
@observer
export class Timeline<T, P extends {data?: T}> extends ListBase<T, TimelineProps<T, P>> {

    get data() {
        return this.props.data;
    }

    private renderLines() {
        const {lineTheme, itemKey, TimelineComponent, lineProps, dateSelector} = this.props;
        return this.displayedData.map((item, idx) =>
            <LineWrapper
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

export default themr("list", styles)(Timeline);

/**
 * Crée un composant affichant une liste sous forme de Timeline.
 * @param props Les props de la timeline.
 */
export function timelineFor<T, P extends {data?: T}>(props: TimelineProps<T, P>) {
    const List = themr("list", styles)(Timeline) as any;
    return <List {...props} />;
}
