import {autobind} from "core-decorators";
import {computed, observable} from "mobx";
import * as React from "react";
import {findDOMNode} from "react-dom";

import Button from "focus-components/button";

import {LineProps} from "./line";

import * as styles from "./style/list.css";
export type ListStyle = Partial<typeof styles>;

export interface ListBaseProps<T, P extends LineProps<T>> {
    classNames?: ListStyle;
    LineComponent: ReactComponent<P>;
    lineProps?: P;
    isManualFetch?: boolean;
    offset?: number;
    perPage?: number;
}

@autobind
export abstract class ListBase<T, P extends ListBaseProps<T, LineProps<T>>> extends React.Component<P, void> {

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

    protected renderManualFetch() {
        const {isManualFetch, classNames} = this.props;
        if (isManualFetch && this.hasMoreData) {
            return (
                <span className={`${styles.button} ${classNames!.button || ""}`}>
                    <Button
                        color="primary"
                        handleOnClick={this.handleShowMore}
                        label="list.button.showMore"
                        type="button"
                    />
                </span>
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
};
