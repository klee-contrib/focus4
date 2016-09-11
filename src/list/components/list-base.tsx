import {autobind} from "core-decorators";
import {Component} from "react";
import {findDOMNode} from "react-dom";

import {ReactComponent} from "../../defaults";

import {LineProps} from "./lines";
import {BaseListProps} from "./memory-list";

export interface ListBaseProps<P extends LineProps<{}>> extends BaseListProps {
    LineComponent: ReactComponent<P>;
    isInfiniteScroll?: boolean;
    isLoading?: boolean;
    /** Default: 250 */
    offset?: number;
    parentSelector?: string;
}

function topOfElement(element: HTMLElement): number {
    if (!element) {
        return 0;
    }
    return element.offsetTop + topOfElement((element.offsetParent as HTMLElement));
};

@autobind
export abstract class ListBase<P extends ListBaseProps<LineProps<{}>>, S> extends Component<P, S> {
    parentNode: Element | Window;

    componentWillUnmount() {
        if (!this.props.isManualFetch) {
            this.detachScrollListener();
        }
    }

    componentDidMount() {
        this.parentNode = this.props.parentSelector ? document.querySelector(this.props.parentSelector) : window;
        if (!this.props.isManualFetch) {
            this.attachScrollListener();
        }
    }

    componentDidUpdate() {
        if (!this.props.isLoading && !this.props.isManualFetch) {
            this.attachScrollListener();
        }
    }

    attachScrollListener() {
        if (!this.props.hasMoreData) {
            return;
        }
        this.parentNode.addEventListener("scroll", this.scrollListener);
        this.parentNode.addEventListener("resize", this.scrollListener);
        this.scrollListener();
    }

    detachScrollListener() {
        this.parentNode.removeEventListener("scroll", this.scrollListener);
        this.parentNode.removeEventListener("resize", this.scrollListener);
    }

    scrollListener() {
        const el = findDOMNode(this) as HTMLElement;
        const scrollTop = ((this.parentNode as Window).pageYOffset !== undefined) ? (this.parentNode as Window).pageYOffset : (this.parentNode as Element).scrollTop;
        if (topOfElement(el) + el.offsetHeight - scrollTop - (window.innerHeight || (this.parentNode as HTMLElement).offsetHeight) < (this.props.offset || 250)) {
            this.detachScrollListener();
            this.handleShowMore();
        }
    }

    handleShowMore() {
        if (!this.props.hasMoreData) {
            return;
        }
        if (this.props.fetchNextPage) {
            return this.props.fetchNextPage();
        }
    }
}
