import {autobind} from "core-decorators";
import {observable, reaction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";

export interface HeaderScrollingProps {
    classNames: {scrolling: string; deployed: string; undeployed: string};
    notifySizeChange?: (isDeployed?: boolean) => void;
    scrollTargetSelector?: string;
}

@autobind
@observer
export class HeaderScrolling extends React.Component<HeaderScrollingProps, void> {

    @observable deployThreshold: number;
    @observable isDeployed = true;
    @observable placeholderHeight: number;

    private header?: Element;
    private reaction: any;
    private scrollTargetNode: Element | Window;

    scrollPosition(domNode?: Element) {
        const y = window.pageYOffset || document.documentElement.scrollTop;
        const x = window.pageXOffset || document.documentElement.scrollLeft;
        if (domNode === undefined) {
            return { top: y, left: x };
        }
        const nodeRect = domNode.getBoundingClientRect();
        return {left: nodeRect.left + x, top: nodeRect.top + y};
    }

    getScrollingElement() {
        if (document.scrollingElement) {
            return document.scrollingElement;
        } else if (document.documentElement) {
            return document.documentElement;
        }
        return document.querySelector("body")!;
    }

    scrollTo(element: Element, to: number) {
        if (element === undefined) {
            window.scrollTo(0, to);
            return;
        }
        element.scrollTop = to;
    }

    componentWillMount() {
        this.handleScroll();
        const {scrollTargetSelector} = this.props;
        this.scrollTargetNode = (scrollTargetSelector && scrollTargetSelector !== "") ? document.querySelector(scrollTargetSelector)! : window;
    }

    componentDidMount() {
        this.scrollTargetNode.addEventListener("scroll", this.handleScroll);
        this.scrollTargetNode.addEventListener("resize", this.handleScroll);
        this.reaction = reaction(() => applicationStore.canDeploy, canDeploy => this.handleScroll(undefined, canDeploy));
    }

    componentWillUnmount() {
        this.scrollTargetNode.removeEventListener("scroll", this.handleScroll);
        this.scrollTargetNode.removeEventListener("resize", this.handleScroll);
        this.reaction();
    }

    notifySizeChange() {
        const {notifySizeChange} = this.props;
        if (notifySizeChange) {
            notifySizeChange(this.isDeployed);
        }
    }

    handleScroll(_?: Event, canDeploy?: boolean) {
        if (this.isDeployed) {
            this.deployThreshold = this.header ? this.header.clientHeight - 60 : 1000;
            this.placeholderHeight = this.header ? this.header.clientHeight : 1000;
        }

        const {top} = this.scrollPosition();
        const isDeployed = (canDeploy !== undefined ? canDeploy : applicationStore.canDeploy) ? top <= this.deployThreshold : false;

        if (isDeployed !== this.isDeployed) {
            this.isDeployed = isDeployed;
            this.notifySizeChange();
        }
    }

    render() {
        const {isDeployed, placeholderHeight} = this;
        const {canDeploy, route} = applicationStore;
        const {scrolling, deployed, undeployed} = this.props.classNames;
        return (
            <header ref={header => this.header = header} className={`${scrolling} ${isDeployed ? deployed : undeployed}`} data-route={route}>
                {this.props.children}
                {!isDeployed ? <div style={{height: canDeploy ? placeholderHeight : 60, width: "100%"}} /> : null}
            </header>
        );
    }
}
