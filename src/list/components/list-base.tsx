import {autobind} from "core-decorators";
import i18n from "i18next";
import {computed, observable} from "mobx";
import * as React from "react";
import {findDOMNode} from "react-dom";

import Button from "focus-components/button";

import {LineStyle} from "./line";

import * as styles from "./__style__/list.css";
export type ListStyle = Partial<typeof styles>;

export interface ListBaseProps<T, P extends {data?: T}> {
    lineTheme?: LineStyle;
    lineProps?: P;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    isManualFetch?: boolean;
    itemKey?: keyof T;
    offset?: number;
    perPage?: number;
    showAllHandler?: () => void;
    theme?: ListStyle;
}

@autobind
export abstract class ListBase<T, P extends ListBaseProps<T, {data?: T}>> extends React.Component<P, void> {

    @observable maxElements = this.props.perPage;
    private page = 1;

    protected abstract get data(): T[];

    @computed
    protected get displayedData() {
        if (this.maxElements) {
            return this.data.slice(0, this.maxElements);
        } else {
            return this.data;
        }
    }

    @computed
    protected get hasMoreData() {
        if (this.maxElements) {
            return this.data.length > this.maxElements;
        } else {
            return false;
        }
    }

    componentDidMount() {
        const {isManualFetch, perPage} = this.props;
        if (!isManualFetch && perPage) {
            this.attachScrollListener();
        }
    }

    componentDidUpdate() {
        this.componentDidMount();
    }

    componentWillUnmount() {
        const {isManualFetch, perPage} = this.props;
        if (!isManualFetch && perPage) {
            this.detachScrollListener();
        }
    }

    protected renderBottomRow() {
        const {theme, i18nPrefix = "focus", isManualFetch, showAllHandler} = this.props;
        if (isManualFetch && this.hasMoreData || showAllHandler) {
            return (
                <div className={theme!.bottomRow!}>
                    {isManualFetch && this.hasMoreData ?
                        <Button
                            handleOnClick={this.handleShowMore}
                            icon="add"
                            shape={null}
                            type="button"
                            label={`${i18n.t(`${i18nPrefix}.list.show.more`)} (${this.displayedData.length} / ${this.data.length} ${i18n.t(`${i18nPrefix}.list.show.displayed`)})`}
                        />
                    : <div />}
                    {showAllHandler ?
                        <Button
                            handleOnClick={showAllHandler}
                            icon="arrow_forward"
                            label={`${i18nPrefix}.list.show.all`}
                            type="button"
                            shape={null}
                        />
                    : null}
                </div>
            );
        } else {
            return null;
        }
    }

    protected handleShowMore() {
        if (this.hasMoreData) {
            this.page = this.page + 1;
            this.maxElements = (this.props.perPage || 5) * this.page;
        }
    }

    private attachScrollListener() {
        if (!this.hasMoreData) {
            return;
        }
        window.addEventListener("scroll", this.scrollListener);
        window.addEventListener("resize", this.scrollListener);
        this.scrollListener();
    }

    private detachScrollListener() {
        window.removeEventListener("scroll", this.scrollListener);
        window.removeEventListener("resize", this.scrollListener);
    }

    private scrollListener() {
        const el = findDOMNode(this) as HTMLElement;
        const scrollTop = window.pageYOffset;
        if (topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight) < (this.props.offset || 250)) {
            this.detachScrollListener();
            this.handleShowMore();
        }
    }
}

function topOfElement(element: HTMLElement): number {
    if (!element) {
        return 0;
    }
    return element.offsetTop + topOfElement((element.offsetParent as HTMLElement));
}
