import {autobind} from "core-decorators";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Checkbox from "focus-components/input-checkbox";

import {EntityField, textFor} from "../../entity";
import {injectStyle} from "../../theming";

import {ListStoreBase} from "../store-base";
import {ContextualActions} from "./contextual-actions";

import * as styles from "./__style__/line.css";
export type LineStyle = Partial<typeof styles>;

export interface OperationListItem<T> {
    action: (data: T | T[]) => void;
    buttonShape?: "raised" | "fab" | "icon" | "mini-fab" | null;
    label?: string;
    icon?: string;
    iconLibrary?: "material" | "font-awesome" | "font-custom";
    isSecondary?: boolean;
    style?: string | React.CSSProperties;
}

export interface GroupOperationListItem<T> extends OperationListItem<T> {
    action: (data: T[]) => void;
}

export interface LineOperationListItem<T> extends OperationListItem<T> {
    action: (data: T) => void;
}

export interface LineWrapperProps<T, P extends {data?: T}> {
    classNames?: LineStyle;
    data: T;
    dateSelector?: (data: T) => EntityField<string>;
    hasSelection?: boolean;
    LineComponent: ReactComponent<P>;
    lineProps?: P;
    operationList?: (data: T) => LineOperationListItem<T>[];
    selectionnableInitializer?: (data: T) => boolean;
    store?: ListStoreBase<T>;
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
        const {LineComponent, data, dateSelector, lineProps, hasSelection, selectionnableInitializer, classNames, operationList, type} = this.props;

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
                <li className={`${styles.line} ${classNames!.line || ""} ${hasSelection ? `${styles.selection} ${classNames!.selection || ""}` : ""}`}>
                    {hasSelection && selectionnableInitializer!(data) ?
                        <div className={`${styles.checkbox} ${classNames!.checkbox || ""} ${this.isSelected ? `${styles.selected} ${classNames!.selected || ""}` : `${styles.unselected} ${classNames!.unselected || ""}`}`}>
                            <Checkbox onChange={this.onSelection} rawInputValue={this.isSelected} />
                        </div>
                    : null}
                    <LineComponent data={data} {...lineProps} />
                    {opList && opList.length > 0 ?
                        <div className={`${styles.actions} ${classNames!.actions || ""}`}>
                            <ContextualActions
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
