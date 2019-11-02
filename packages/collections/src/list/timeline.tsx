import i18next from "i18next";
import {observer} from "mobx-react";
import * as React from "react";

import {EntityField, FieldEntry} from "@focus4/stores";
import {getIcon, themr, useTheme} from "@focus4/styling";
import {Button} from "@focus4/toolbox";

import {LineProps, lineStyles, LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import listStyles from "./__style__/list.css";
const Theme = themr("list", listStyles);

/** Props du composant de TimeLine. */
export interface TimelineProps<T> extends ListBaseProps<T> {
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
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
        const {lineTheme, itemKey, TimelineComponent, dateSelector, pageItemIndex = 5} = this.props;
        return this.displayedData.map((item, idx) => (
            <LineWrapper
                key={itemKey(item, idx)}
                data={item}
                dateSelector={dateSelector}
                domRef={
                    this.displayedData.length - idx === pageItemIndex ||
                    (this.displayedData.length < pageItemIndex && this.displayedData.length - 1 === idx)
                        ? this.registerSentinel
                        : undefined
                }
                LineComponent={TimelineComponent}
                theme={lineTheme}
                type="timeline"
            />
        ));
    }

    render() {
        const {addItemHandler, i18nPrefix = "focus"} = this.props;
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <ul className={theme.timeline()}>
                        {addItemHandler ? (
                            <TimelineAddItem addItemHandler={addItemHandler} i18nPrefix={i18nPrefix} />
                        ) : null}
                        {this.renderLines()}
                        {this.renderBottomRow(theme)}
                    </ul>
                )}
            </Theme>
        );
    }
}

function TimelineAddItem({addItemHandler, i18nPrefix}: {addItemHandler: () => void; i18nPrefix: string}) {
    const theme = useTheme("line", lineStyles);
    return (
        <li className={theme.timelineAdd()}>
            <div className={theme.timelineBadge()} />
            <div className={theme.timelinePanel()}>
                <Button
                    primary
                    icon={getIcon(`${i18nPrefix}.icons.list.add`)}
                    label={i18next.t(`${i18nPrefix}.list.add`)}
                    onClick={addItemHandler}
                />
            </div>
        </li>
    );
}

/**
 * Crée un composant affichant une liste sous forme de Timeline.
 * @param props Les props de la timeline.
 */
export function timelineFor<T>(props: TimelineProps<T>) {
    return <Timeline {...props} />;
}
