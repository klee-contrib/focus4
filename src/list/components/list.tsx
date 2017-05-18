import {autobind} from "core-decorators";
import i18n from "i18next";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {findDOMNode} from "react-dom";
import {spring, Style, TransitionMotion} from "react-motion";

import Button from "focus-components/button";
import Icon from "focus-components/icon";

import {classAutorun, classReaction} from "../../util";

import {LineOperationListItem} from "./contextual-actions";
import {LineWrapper, LineWrapperProps} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";

export interface ListProps<T, P extends {data?: T}> extends ListBaseProps<T, P> {
    addItemHandler?: () => void;
    data?: T[];
    DetailComponent?: React.ComponentClass<{data: T}> | React.SFC<{data: T}>;
    detailHeight?: number;
    hideAddItemHandler?: boolean;
    LineComponent?: React.ComponentClass<P> | React.SFC<P>;
    mode?: "list" | "mosaic";
    mosaic?: {width: number, height: number};
    MosaicComponent?: React.ComponentClass<P> | React.SFC<P>;
    operationList?: (data: T) => LineOperationListItem<T>[];
}

export interface LineItem<P> {
    key: string;
    data: {
        Component: React.ComponentClass<P> | React.SFC<P>,
        props?: P
    };
    style: Style;
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

    @observable private byLine: number;
    @observable private displayedIdx?: number;

    componentDidMount() {
        super.componentDidMount();
        window.addEventListener("resize", this.updateByLine);
        this.updateByLine();
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        this.updateByLine();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        window.removeEventListener("resize", this.updateByLine);
    }

    @classAutorun
    private updateByLine() {
        this.byLine = this.mode === "mosaic" ? Math.floor(findDOMNode(this).clientWidth / (this.mosaic.width + 10)) : 1;
    }

    @classReaction((that: ListWithoutStyle<any, any, any>) => () => that.displayedData.length)
    protected closeDetail() {
        this.displayedIdx = undefined;
    }

    @computed
    protected get addItemHandler() {
        const {listWrapper} = this.context;
        return this.props.addItemHandler || listWrapper && listWrapper.addItemHandler;
    }

    @computed
    protected get mode() {
        const {mode, MosaicComponent, LineComponent} = this.props;
        const {listWrapper} = this.context;
        return mode || listWrapper && listWrapper.mode || MosaicComponent && !LineComponent && "mosaic" || "list";
    }

    @computed
    protected get mosaic() {
        const {listWrapper} = this.context;
        return this.props.mosaic || listWrapper && listWrapper.mosaic || {width: 200, height: 200};
    }

    protected get data() {
        return this.props.data || [];
    }

    @computed
    private get isAddItemShown() {
        return !!(!this.props.hideAddItemHandler && this.addItemHandler && this.mode === "mosaic");
    }

    protected getItems(Component: React.ComponentClass<P> | React.SFC<P>): LineItem<LineWrapperProps<T, P>>[] {
        const {itemKey, lineTheme, lineProps, operationList} = this.props;
        return this.displayedData.map((item, idx) => ({
            key: `${itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}`,
            data: {
                Component: LineWrapper,
                props: {
                    theme: lineTheme,
                    data: item,
                    mosaic: this.mode === "mosaic" ? this.mosaic : undefined,
                    LineComponent: Component,
                    lineProps,
                    operationList,
                    onLineClick: () => this.onLineClick(idx)
                }
            },
            style: {}
        }));
    }

    @action
    protected onLineClick(idx: number) {
        this.displayedIdx = this.displayedIdx !== idx ? idx : undefined;
    }

    @computed
    private get lines() {
        const {theme, i18nPrefix = "focus", LineComponent, MosaicComponent, DetailComponent, detailHeight = 200} = this.props;

        let Component;
        if (this.mode === "list" && LineComponent) {
            Component = LineComponent;
        } else if (this.mode === "mosaic" && MosaicComponent) {
            Component = MosaicComponent;
        } else {
            throw new Error("Aucun component de ligne ou de mosaïque n'a été précisé.");
        }

        const items: LineItem<any>[] = this.getItems(Component);

        if (DetailComponent && this.displayedIdx !== undefined) {
            let idx = this.displayedIdx + (this.isAddItemShown || this.mode === "list" ? 1 : 0);

            if (this.mode === "mosaic") {
                idx += this.byLine - idx % this.byLine - (this.isAddItemShown ? 1 : 0);
            }
            const item = this.displayedData[this.displayedIdx];

            items.splice(idx, 0, {
                key: `detail-${idx}`,
                data: {
                    Component: ({style: {height}}: {style: {height: number}}) => (
                        <li
                            className={theme!.detailWrapper!}
                            style={{
                                width: height < 1 ? 0 : undefined,
                                height: Math.round(height)
                            }}
                        >
                            <div className={theme!.triangle!} style={this.displayedIdx === undefined && this.mode === "mosaic" ? {left: -1000} : this.mode === "mosaic" ? {left: -8.25 + this.mosaic.width / 2 + ((this.displayedIdx! + (this.isAddItemShown ? 1 : 0)) % this.byLine) * (10 + this.mosaic.width)} : {}} />
                            <div className={theme!.detail}>
                                <Button icon="clear" onClick={() => this.displayedIdx = undefined} shape="icon" />
                                <DetailComponent data={item} />
                            </div>
                        </li>
                    )
                },
                style: {height: spring(detailHeight + 40)}
            });
        }

        if (this.isAddItemShown) {
            items.splice(0, 0, {
                key: "mosaic-add",
                data: {
                    Component: () => (
                        <div
                            className={theme!.mosaicAdd!}
                            style={{width: this.mosaic.width, height: this.mosaic.height}}
                            onClick={this.addItemHandler}
                        >
                            <Icon name="add" />
                            {i18n.t(`${i18nPrefix}.list.add`)}
                        </div>
                    )
                },
                style: {}
            });
        }

        return items;
    }

    render() {
        const {theme} = this.props;
        return (
            <div>
                <TransitionMotion
                    willEnter={() => ({height: 0})}
                    willLeave={({style}: {style: Style}) => {
                        if (style.height) {
                            return {height: spring(0)};
                        }
                        return;
                    }}
                    styles={this.lines.slice()}
                >
                    {(items: LineItem<any>[]) => (
                        <ul className={this.mode === "list" ? theme!.list! : theme!.mosaic!}>
                            {items.map(({key, style, data: {Component, props}}) => <Component key={key} style={style} {...props} />)}
                        </ul>
                    )}
                </TransitionMotion>
                {this.renderBottomRow()}
            </div>
        );
    }
}

export const List = themr("list", styles)(ListWithoutStyle);

export function listFor<T, P extends {data?: T}>(props: ListProps<T, P>) {
    const List2 = List as any;
    return <List2 {...props} />;
}
