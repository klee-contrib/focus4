import {useObserver} from "mobx-react";
import {ComponentType} from "react";

import {CollectionStore, EntityField, FieldEntry} from "@focus4/stores";
import {CSSProp, useTheme} from "@focus4/styling";

import {ListBaseProps, useListBase} from "../list-base";
import {
    AddItemProps,
    DefaultAddItemComponent,
    DefaultEmptyComponent,
    DefaultLoadingComponent,
    EmptyProps,
    LoadingProps
} from "../shared";
import {TimelineAddItem} from "./add";
import {TimelineLine} from "./line";

import timelineCss, {TimelineCss} from "../__style__/timeline.css";
export {timelineCss, TimelineCss};

/** Props du composant de TimeLine. */
export type TimelineProps<T> = ListBaseProps<T> & {
    /** Composant personnalisé pour le bouton "Ajouter". */
    AddItemComponent?: ComponentType<AddItemProps<T>>;
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Le sélecteur du champ contenant la date. */
    dateSelector: (data: T) => EntityField<FieldEntry<"string">>;
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ComponentType<EmptyProps<T>>;
    /** Composant à afficher pendant le chargement. */
    LoadingComponent?: ComponentType<LoadingProps<T>>;
    /** CSS. */
    theme?: CSSProp<TimelineCss>;
    /** Le composant de ligne. */
    TimelineComponent: ComponentType<{data: T}>;
} & (
        | {
              /** Les données. */
              data: T[];
          }
        | {
              /** Store de liste ou de recherche. */
              store: CollectionStore<T>;
          }
    );

/** Composant affichant une liste sous forme de Timeline. */
export function Timeline<T>({
    AddItemComponent = DefaultAddItemComponent,
    addItemHandler,
    dateSelector,
    EmptyComponent = DefaultEmptyComponent,
    LoadingComponent = DefaultLoadingComponent,
    TimelineComponent,
    theme: pTheme,
    ...baseProps
}: TimelineProps<T>) {
    const theme = useTheme("timeline", timelineCss, pTheme);
    return useObserver(() => {
        const {bottomRow, displayedData, getDomRef, i18nPrefix, isLoading, itemKey, store} = useListBase(baseProps);
        return !isLoading && !displayedData.length ? (
            <EmptyComponent addItemHandler={addItemHandler} i18nPrefix={i18nPrefix} store={store} />
        ) : (
            <ul className={theme.timeline()}>
                {addItemHandler ? (
                    <TimelineAddItem theme={theme}>
                        <AddItemComponent
                            addItemHandler={addItemHandler}
                            mode="timeline"
                            i18nPrefix={i18nPrefix}
                            store={store}
                        />
                    </TimelineAddItem>
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
                {isLoading ? <LoadingComponent i18nPrefix={i18nPrefix} store={store} /> : null}
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
