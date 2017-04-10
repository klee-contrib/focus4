import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";

import {injectStyle, StyleInjector} from "../../theming";

import {LineOperationListItem, LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import {list, mosaic, topRow} from "./__style__/list.css";

export interface ListProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    data?: T[];
    /** Par défaut (si les deux modes existent) : "list" */
    initialMode?: "list" | "mosaic";
    LineComponent?: ReactComponent<P>;
    MosaicComponent?: ReactComponent<P>;
    operationList?: (data: T) => LineOperationListItem<T>[];
}

@autobind
@observer
export class ListWithoutStyle<T, P extends {data?: T}, AP> extends ListBase<T, ListProps<T, P> & AP> {

    @observable
    protected displayMode = this.props.initialMode || !this.props.LineComponent && this.props.MosaicComponent ? "mosaic" : "list";

    protected get data() {
        return this.props.data || [];
    }

    protected renderLines() {
        const {itemKey, lineClassNames, LineComponent, MosaicComponent, lineProps, operationList, extraItems = [], extraItemsPosition = "after"} = this.props;
        const Line = LineWrapper as new() => LineWrapper<T, P>;

        let Component: ReactComponent<P>;
        if (this.displayMode === "list" && LineComponent) {
            Component = LineComponent;
        } else if (this.displayMode === "mosaic" && MosaicComponent) {
            Component = MosaicComponent;
        } else {
            throw new Error("Aucun component de ligne ou de mosaïque n'a été précisé.");
        }

        const items = this.displayedData.map((item, idx) => (
            <Line
                key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                classNames={lineClassNames}
                data={item}
                LineComponent={Component}
                lineProps={lineProps}
                operationList={operationList}
            />
        ));

        if (extraItemsPosition === "after") {
            return [...items, ...extraItems];
        } else {
            return [...extraItems, ...items];
        }
    }

    protected renderTopRow() {
        const {classNames, LineComponent, MosaicComponent} = this.props;
        if (LineComponent && MosaicComponent) {
            return (
                <div className={`${topRow} ${classNames!.topRow || ""}`}>
                    <Button
                        onClick={() => this.displayMode = this.displayMode === "list" ? "mosaic" : "list"}
                        icon={this.displayMode === "list" ? "apps" : "list"}
                        shape="icon"
                        label={this.displayMode === "list" ? "list.mosaic" : "list.list"}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        const {classNames} = this.props;
        return (
            <div>
                {this.renderTopRow()}
                <ul className={`${this.displayMode === "list" ? `${list} ${classNames!.list || ""}` : `${mosaic} ${classNames!.mosaic || ""}`}`}>
                    {this.renderLines()}
                </ul>
                {this.renderBottomRow()}
            </div>
        );
    }
}

export const List: StyleInjector<ListWithoutStyle<{}, {data?: {}}, {}>> = injectStyle("list", ListWithoutStyle) as any;

export function listFor<T, P extends {data?: T}>(props: ListProps<T, P>) {
    const List2 = List as any;
    return <List2 {...props} />;
}
