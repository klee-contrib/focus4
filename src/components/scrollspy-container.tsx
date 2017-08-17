import {autobind} from "core-decorators";
import i18next from "i18next";
import {uniqueId} from "lodash";
import { action, computed, observable } from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {findDOMNode} from "react-dom";

import {ButtonBackToTop} from "./button-back-to-top";
import {PanelDescriptor} from "./panel";

export interface ScrollsyContainerProps {
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Largeur du menu. Par défaut : 250. */
    menuWidth?: boolean;
    /** Offset entre la position du panel et la position de scroll au clic sur le menu. Par défaut : 150. */
    scrollToOffset?: number;
    /** Vitesse de scroll. Par défaut : 40. */
    speed?: number;
}

@autobind
@observer
export class ScrollspyContainer extends React.Component<ScrollsyContainerProps, void> {

    @observable private menuTop = 0;
    @observable private scrollTop = 0;

    private readonly panels = observable.map<PanelDescriptor>();

    static childContextTypes = {
        scrollspy: React.PropTypes.object
    };

    getChildContext() {
        return {
            scrollspy: {
                registerPanel: this.registerPanel,
                removePanel: this.removePanel,
                updatePanel: this.updatePanel
            }
        };
    }

    private registerPanel(panel: PanelDescriptor) {
        const id = uniqueId("ssc-panel");
        this.panels.set(id, panel);
        return id;
    }

    private removePanel(id: string) {
        this.panels.delete(id);
    }

    private updatePanel(id: string, panel: PanelDescriptor) {
        this.panels.set(id, panel);
    }

    componentDidMount() {
        window.addEventListener("scroll", this.onScroll);
        window.addEventListener("resize", this.onScroll);
        this.onScroll();
    }

    componentDidUpdate() {
        this.onScroll();
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.onScroll);
        window.removeEventListener("resize", this.onScroll);
    }

    @action
    private onScroll() {
        this.scrollTop = document.body.scrollTop;
        this.menuTop = this.getOffsetTop(findDOMNode(this), true);
    }

    @computed
    private get menuItems() {
        return this.panels.entries().map(([id, {node, title}]) => ({
            id,
            label: title && i18next.t(title),
            onClick: () => this.scrollTo(node)
        }));
    }

    @computed
    private get activeItem() {
        const active = this.panels.entries().reverse().find(([_, {node}]) => this.getOffsetTop(node) <= this.scrollTop);
        return active && active[0] || this.panels.entries()[0] && this.panels.entries()[0][0];
    }

    private getOffsetTop(node: HTMLElement, removeOffset?: boolean) {
        let distance = 0;
        if (node.offsetParent) {
            do {
                distance += node.offsetTop;
                node = node.offsetParent as HTMLElement;
            } while (node);
        }
        return (distance < 0 ? 0 : distance) - (!removeOffset ? (this.props.scrollToOffset || 150) : 0);
    }

    private scrollTo(node: HTMLDivElement) {
        const {speed = 40} = this.props;
        const diff = document.body.scrollTop - this.getOffsetTop(node);
        if (document.body.scrollTop !== this.getOffsetTop(node) && (diff <= 0 && window.pageYOffset < document.body.scrollHeight - window.innerHeight || diff >= 0 && document.body.scrollHeight !== 0)) {
            window.scrollBy(0, -Math.sign(diff) * Math.min(Math.abs(diff), speed));
            requestAnimationFrame(() => this.scrollTo(node));
        }
    }

    render() {
        const {children, hideBackToTop, menuWidth = 250} = this.props;
        return (
            <div>
                <nav style={{position: "fixed", top: this.menuTop}}>
                    <ul>
                        {this.menuItems.map(({label, id, onClick}) =>
                            <li key={id} onClick={onClick}>{label} {this.activeItem === id ? "ok" : "déso"}</li>
                        )}
                    </ul>
                </nav>
                <div style={{marginLeft: menuWidth}}>
                    {children}
                </div>
                {!hideBackToTop ? <ButtonBackToTop /> : null}
            </div>
        );
    }
}

export default ScrollspyContainer;
