import {useObserver} from "mobx-react-lite";
import * as React from "react";

import {EntityField, FieldEntry, ListStoreBase} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import {ListBaseProps, useListBase} from "../list-base";
import {TimelineAddItem} from "./add";
import {TimelineLine} from "./line";

import timelineCss, {TimelineCss} from "../__style__/timeline.css";
export {timelineCss, TimelineCss};

/** Props du composant de TimeLine. */
export type TimelineProps<T> = ListBaseProps<T> & {
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Le sélecteur du champ contenant la date. */
    dateSelector: (data: T) => EntityField<FieldEntry<string>>;
    /** CSS. */
    theme?: CSSProp<TimelineCss>;
    /** Le composant de ligne. */
    TimelineComponent: React.ComponentType<{data: T}>;
} & (
        | {
              /** Les données. */
              data: T[];
          }
        | {
              /** Store de liste ou de recherche. */
              store: ListStoreBase<T>;
          }
    );

/** Composant affichant une liste sous forme de Timeline. */
export function Timeline<T>({
    addItemHandler,
    dateSelector,
    TimelineComponent,
    theme: pTheme,
    ...baseProps
}: TimelineProps<T>) {
    const theme = useTheme("timeline", timelineCss, pTheme);
    return useObserver(() => {
        const {bottomRow, displayedData, getDomRef, i18nPrefix, itemKey} = useListBase(baseProps);
        return (
            <ul className={theme.timeline()}>
                {addItemHandler ? (
                    <TimelineAddItem addItemHandler={addItemHandler} i18nPrefix={i18nPrefix} theme={theme} />
                ) : null}
                {displayedData.map((item, idx) => (
                    <TimelineLine
                        key={itemKey(item, idx)}
                        data={item}
                        dateSelector={dateSelector}
                        domRef={getDomRef(idx)}
                        LineComponent={TimelineComponent}
                        theme={theme}
                    />
                ))}
                {bottomRow}
            </ul>
        );
    });
}

/**
 * Crée un composant affichant une liste sous forme de Timeline.
 * @param props Les props de la timeline.
 */
export function timelineFor<T>(props: TimelineProps<T>) {
    return <Timeline {...props} />;
}
