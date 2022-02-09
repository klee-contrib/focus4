import i18next from "i18next";
import {isObservableArray} from "mobx";
import {useDragLayer} from "react-dnd";

import {CSSProp, useTheme} from "@focus4/styling";
import {FontIcon} from "@focus4/toolbox";

import dragLayerCss, {DragLayerCss} from "./__style__/drag-layer.css";
export {dragLayerCss, DragLayerCss};

/** Props du layer de drag an drop. */
export interface DndDragLayerProps {
    /** L'offset courant. */
    currentOffset?: {x: number; y: number};
    /** Préfixe i18n. */
    i18nPrefix?: string;
    /** Drag en cours. */
    isDragging?: boolean;
    /** La liste en cours de drag. */
    item?: {dragged: {}[]};
    /** CSS. */
    theme?: CSSProp<DragLayerCss>;
}

/** Layer de drag and drop pour afficher le nombre d'items. */
export function DndDragLayer({i18nPrefix = "focus", theme: pTheme}: DndDragLayerProps) {
    const theme = useTheme("dragLayer", dragLayerCss, pTheme);

    const {currentOffset, isDragging, item} = useDragLayer(monitor => ({
        currentOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem<{}[]>()
    }));

    if (!isDragging || !item || !isObservableArray(item) || !currentOffset) {
        return <div />;
    }

    const {x, y} = currentOffset;

    if (x === 0 && y === 0) {
        return <div />;
    }

    return (
        <div className={theme.container()}>
            <div className={theme.layer()} style={{transform: `translate(${x - 18}px, ${y - 20}px)`}}>
                <FontIcon>drag_handle</FontIcon>
                <div className={theme.count()}>{item.length}</div>
                <div>{i18next.t(`${i18nPrefix}.dragLayer.item`, {count: item.length})}</div>
            </div>
        </div>
    );
}
