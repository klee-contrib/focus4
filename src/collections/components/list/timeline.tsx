import {observer} from "mobx-react";
import * as React from "react";

import {EntityField, FieldEntry} from "../../../entity";
import {themr} from "../../../theme";

import {LineProps, LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";
const Theme = themr("list", styles);

/** Props du composant de TimeLine. */
export interface TimelineProps<T> extends ListBaseProps<T> {
    /** Les données. */
    data: T[];
    /** Le sélecteur du champ contenant la date. */
    dateSelector: (data: T) => EntityField<FieldEntry<string>>;
    /** Le composant de ligne. */
    TimelineComponent: React.ComponentType<LineProps<T>>;
}

/** Composant affichant une liste sous forme de Timeline. */
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
            <Theme theme={this.props.theme}>
                {theme =>
                    <ul className={theme.timeline}>
                        {this.renderLines()}
                        {this.renderBottomRow(theme)}
                    </ul>
                }
            </Theme>
        );
    }
}

/**
 * Crée un composant affichant une liste sous forme de Timeline.
 * @param props Les props de la timeline.
 */
export function timelineFor<T>(props: TimelineProps<T>) {
    return <Timeline {...props} />;
}
