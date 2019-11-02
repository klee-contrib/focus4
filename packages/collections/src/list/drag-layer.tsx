import i18next from "i18next";
import * as React from "react";
import {useDragLayer} from "react-dnd";

import {CSSToStrings, useTheme} from "@focus4/styling";
import {FontIcon} from "@focus4/toolbox";

import dragLayerStyles, {DragLayerCss} from "./__style__/drag-layer.css";
export {dragLayerStyles};
export type DragLayerStyle = CSSToStrings<DragLayerCss>;

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
    theme?: DragLayerStyle;
}

/** Layer de drag and drop pour afficher le nombre d'items. */
export function DndDragLayer({i18nPrefix = "focus", theme: pTheme}: DndDragLayerProps) {
    const theme = useTheme("dragLayer", dragLayerStyles, pTheme);

    const {currentOffset, isDragging, item} = useDragLayer(monitor => ({
        currentOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem()
    }));

    if (!isDragging || !item || !item.dragged || !currentOffset) {
        return <div />;
    }

    const {x, y} = currentOffset;

    if (x === 0 && y === 0) {
        return <div />;
    }

    return (
        <div className={theme.container}>
            <div className={theme.layer} style={{transform: `translate(${x - 18}px, ${y - 20}px)`}}>
                <FontIcon>drag_handle</FontIcon>
                <div className={theme.count}>{item.dragged.length}</div>
                <div>{i18next.t(`${i18nPrefix}.dragLayer.item${item.dragged.length !== 1 ? "s" : ""}`)}</div>
            </div>
        </div>
    );
}
