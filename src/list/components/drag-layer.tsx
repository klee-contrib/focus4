import * as React from "react";
import {DragLayer} from "react-dnd";
import {FontIcon} from "react-toolbox/lib/font_icon";

@DragLayer<any>(monitor => ({
    item: monitor.getItem(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging()
}))
export class DndDragLayer extends React.Component<any, any> {

    render() {
        const {item, isDragging, currentOffset} = this.props;
        if (!isDragging) {
            return null;
        }

        return (
            <div style={{
                position: "fixed",
                pointerEvents: "none",
                zIndex: 100,
                left: 0,
                top: 0,
                width: "100%",
                height: "100%"
            }}>
                <div style={(() => {
                    if (!currentOffset || !item) {
                        return {
                            display: "none"
                        };
                    }

                    const { x, y } = currentOffset;
                    const transform = `translate(${x - 18}px, ${y - 20}px)`;
                    return {
                        display: "flex",
                        alignItems: "center",
                        transform,
                        height: 30,
                        width: 130,
                        padding: 5,
                        background: "white",
                        borderRadius: 2,
                        boxShadow: `0 2px 2px 0 rgba(0, 0, 0, 0.14),
                                0 3px 1px -2px rgba(0, 0, 0, 0.2),
                                0 1px 5px 0 rgba(0, 0, 0, 0.12)`
                    };
                })()}>
                    <FontIcon>drag_handle</FontIcon>
                    <div style={{
                        background: "rebeccapurple",
                        borderRadius: 50,
                        color: "white",
                        padding: 5,
                        height: 30,
                        width: 30,
                        boxSizing: "border-box",
                        textAlign: "center",
                        margin: "0 5px"
                    }}>{item.dragged.length}</div><div>élément{item.dragged.length !== 1 ? "s" : ""}</div>
                </div>
            </div>
        );
    }
}
