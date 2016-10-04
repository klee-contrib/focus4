import {autobind} from "core-decorators";
import {observable, reaction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {applicationStore} from "../../store";

export interface HeaderProps {
    notifySizeChange?: (isDeployed?: boolean) => void;
    scrollTargetSelector?: string;
}

@autobind
@observer
export class HeaderScrolling extends React.Component<HeaderProps, void> {

    @observable deployThreshold: number;
    @observable isDeployed = true;
    @observable placeholderHeight: number;

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

    isAtPageBottom(domNode: Element) {
        return this.scrollPosition().top >= this.getScrollingElement().scrollHeight - window.innerHeight;
    }

    getScrollingElement() {
        if (document.scrollingElement) {
            return document.scrollingElement;
        } else if (document.documentElement) {
            return document.documentElement;
        }
        return document.querySelector("body")!;
    }

    scrollTo(element: Element, to: number, duration = 500) {
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

    handleScroll(event?: Event, canDeploy?: boolean) {
        if (this.isDeployed) {
            const content = this.refs ? this.refs["header"] as Element : undefined;
            this.deployThreshold = content ? content.clientHeight - 60 : 1000;
            this.placeholderHeight = content ? content.clientHeight : 1000;
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
        const {canDeploy, mode, route} = applicationStore;
        return (
            <header ref="header" data-focus="header-scrolling" data-mode={mode} data-route={route} data-deployed={isDeployed}>
                {this.props.children}
                {!isDeployed ? <div style={{height: canDeploy ? placeholderHeight : 60, width: "100%"}} /> : null}
            </header>
        );
    }
}
