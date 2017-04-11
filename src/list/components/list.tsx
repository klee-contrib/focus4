import {autobind} from "core-decorators";
import i18n from "i18next";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import Icon from "focus-components/icon";

import {injectStyle, StyleInjector} from "../../theming";

import {LineOperationListItem} from "./contextual-actions";
import {LineWrapper} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import {list, mosaic, mosaicAdd} from "./__style__/list.css";

export interface ListProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    addItemHandler?: () => void;
    data?: T[];
    hideAddItemHandler?: boolean;
    LineComponent?: ReactComponent<P>;
    mode?: "list" | "mosaic";
    mosaic?: {width: number, height: number};
    MosaicComponent?: ReactComponent<P>;
    operationList?: (data: T) => LineOperationListItem<T>[];
}

@autobind
@observer
export class ListWithoutStyle<T, P extends {data?: T}, AP> extends ListBase<T, ListProps<T, P> & AP> {

    static contextTypes = {
        listWrapper: React.PropTypes.object
    };

    context: {
        listWrapper?: {
            addItemHandler: () => void;
            mosaic: {
                width: number;
                height: number;
            },
            mode: "list" | "mosaic";
        }
    };

    @computed
    protected get addItemHandler() {
        return this.props.addItemHandler || this.context.listWrapper && this.context.listWrapper.addItemHandler;
    }

    @computed
    protected get mode() {
        return this.props.mode || this.context.listWrapper && this.context.listWrapper.mode || "list";
    }

    @computed
    protected get mosaic() {
        return this.mode === "list" ? undefined : this.props.mosaic || this.context.listWrapper && this.context.listWrapper.mosaic || {width: 200, height: 200};
    }

    protected get data() {
        return this.props.data || [];
    }

    protected getItems(Line: new() => LineWrapper<T, P>, Component: ReactComponent<P>) {
        const {itemKey, lineClassNames, lineProps, operationList} = this.props;
        return this.displayedData.map((item, idx) => (
            <Line
                key={itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}
                classNames={lineClassNames}
                data={item}
                mosaic={this.mosaic}
                LineComponent={Component}
                lineProps={lineProps}
                operationList={operationList}
            />
        ));
    }

    private renderLines() {
        const {classNames, hideAddItemHandler, LineComponent, MosaicComponent} = this.props;

        let Component;
        if (this.mode === "list" && LineComponent) {
            Component = LineComponent;
        } else if (this.mode === "mosaic" && MosaicComponent) {
            Component = MosaicComponent;
        } else {
            throw new Error("Aucun component de ligne ou de mosaïque n'a été précisé.");
        }

        let items = this.getItems(LineWrapper, Component);

        if (!hideAddItemHandler && this.addItemHandler && this.mode === "mosaic" && this.mosaic) {
            items = [(
                <div
                    className={`${mosaicAdd} ${classNames!.mosaicAdd || ""}`}
                    style={{width: this.mosaic.width, height: this.mosaic.height}}
                    onClick={this.addItemHandler}
                >
                    <Icon name="add" />
                    {i18n.t("list.add")}
                </div>
            ), ...items];
        }

        return items;
    }

    render() {
        const {classNames} = this.props;
        return (
            <div>
                <ul className={`${this.mode === "list" ? `${list} ${classNames!.list || ""}` : `${mosaic} ${classNames!.mosaic || ""}`}`}>
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
