import {autobind} from "core-decorators";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";

import {EntityField, textFor} from "../../entity";
import {injectStyle} from "../../theming";

import {MiniListStore} from "../store-base";
import {ContextualActions, LineOperationListItem} from "./contextual-actions";

import * as styles from "./__style__/line.css";

export type LineStyle = Partial<typeof styles>;

export interface LineWrapperProps<T, P extends {data?: T}> {
    classNames?: LineStyle;
    data: T;
    dateSelector?: (data: T) => EntityField<string>;
    hasSelection?: boolean;
    LineComponent: ReactComponent<P>;
    lineProps?: P;
    mosaic?: {width: number, height: number};
    operationList?: (data: T) => LineOperationListItem<T>[];
    selectionnableInitializer?: (data: T) => boolean;
    store?: MiniListStore<T>;
    type?: "table" | "timeline";
}

@injectStyle("line")
@autobind
@observer
export class LineWrapper<T, P extends {data?: T}> extends React.Component<LineWrapperProps<T, P>, void> {

    @computed
    get isSelected() {
        const {store} = this.props;
        return store && store.selectedItems.has(this.props.data) || false;
    }

    onSelection() {
        const {store} = this.props;
        if (store) {
            store.toggle(this.props.data);
        }
    }

    render() {
        const {LineComponent, data, dateSelector, lineProps = {} as any, hasSelection, mosaic, selectionnableInitializer, classNames, operationList, type, store} = this.props;

        if (type === "table") {
            return <LineComponent data={data} {...lineProps} />;
        } else if (type === "timeline") {
            return (
                <li>
                    <div className={`${styles.timelineDate} ${classNames!.timelineDate || ""}`}>{textFor(dateSelector!(data))}</div>
                    <div className={`${styles.timelineBadge} ${classNames!.timelineBadge || ""}`}></div>
                    <div className={`${styles.timelinePanel} ${classNames!.timelinePanel || ""}`}>
                        <LineComponent data={data} {...lineProps} />
                    </div>
                </li>
            );
        } else {
            const opList = operationList && operationList(data);
            return (
                <li
                    className={`${mosaic ? `${styles.mosaic} ${classNames!.mosaic || ""}` : `${styles.line} ${classNames!.line || ""}`}`}
                    style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}
                >
                    {hasSelection && selectionnableInitializer!(data) && store ?
                        <Button
                            className={`${styles.checkbox} ${classNames!.checkbox || ""} ${store.selectedItems.size ? `${styles.isSelection} ${classNames!.isSelection || ""}` : ""}`}
                            shape="icon"
                            icon={this.isSelected ? "check_box" : "check_box_outline_blank"}
                            onClick={this.onSelection}
                            color={this.isSelected ? "primary" : undefined}
                        />
                    : null}
                    <LineComponent data={data} {...lineProps} />
                    {opList && opList.length > 0 ?
                        <div
                            className={`${styles.actions} ${classNames!.actions || ""}`}
                            style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}
                        >
                            <ContextualActions
                                buttonShape={mosaic ? "mini-fab" : null}
                                operationList={opList}
                                operationParam={data}
                            />
                        </div>
                    : null}
                </li>
            );
        }
    }
}
