import i18next from "i18next";
import * as React from "react";
import {DragLayer} from "react-dnd";
import {FontIcon} from "react-toolbox/lib/font_icon";

import {themr} from "../../../theme";

import * as styles from "./__style__/drag-layer.css";
export type DragLayerStyle = Partial<typeof styles>;
const Theme = themr("dragLayer", styles);

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

export const DndDragLayer = DragLayer(monitor => ({
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
    item: monitor.getItem()
}))(
    class DndDragLayerClass extends React.Component<DndDragLayerProps> {
        render() {
            const {currentOffset, i18nPrefix = "focus", isDragging, item, theme: pTheme} = this.props;

            if (!isDragging || !item || !item.dragged) {
                return <div />;
            }

            return (
                <Theme theme={pTheme}>
                    {theme => (
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
                                <div>
                                    {i18next.t(`${i18nPrefix}.dragLayer.item${item.dragged.length !== 1 ? "s" : ""}`)}
                                </div>
                            </div>
                        </div>
                    )}
                </Theme>
            );
        }
    }
);
