import i18next from "i18next";
import * as React from "react";
import {DragLayer} from "react-dnd";
import {FontIcon} from "react-toolbox/lib/font_icon";

import {useTheme} from "@focus4/styling";

import dragLayerStyles from "./__style__/drag-layer.css";
export {dragLayerStyles};
export type DragLayerStyle = Partial<typeof dragLayerStyles>;

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

export const DndDragLayer = DragLayer<DndDragLayerProps>(monitor => ({
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
    item: monitor.getItem()
}))(function DndDragLayerComponent({
    currentOffset,
    i18nPrefix = "focus",
    isDragging,
    item,
    theme: pTheme
}: DndDragLayerProps) {
    const theme = useTheme("dragLayer", dragLayerStyles, pTheme);

    if (!isDragging || !item || !item.dragged) {
        return <div />;
    }

    return (
        <div className={theme.container}>
            <div
                className={theme.layer}
                style={
                    !currentOffset
                        ? {display: "none"}
                        : {transform: `translate(${currentOffset.x - 18}px, ${currentOffset.y - 20}px)`}
                }
            >
                <FontIcon>drag_handle</FontIcon>
                <div className={theme.count}>{item.dragged.length}</div>
                <div>{i18next.t(`${i18nPrefix}.dragLayer.item${item.dragged.length !== 1 ? "s" : ""}`)}</div>
            </div>
        </div>
    );
});
