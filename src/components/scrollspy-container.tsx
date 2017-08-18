import scroll from "smoothscroll-polyfill";
scroll.polyfill();

import {autobind} from "core-decorators";
import i18next from "i18next";
import {uniqueId} from "lodash";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {findDOMNode} from "react-dom";

import ButtonBackToTop from "./button-back-to-top";
import {PanelDescriptor} from "./panel";

import * as styles from "./__style__/scrollspy-container.css";

export type ScrollspyStyle = Partial<typeof styles>;

export interface ScrollspyContainerProps {
    /** Cache le bouton de retour en haut. */
    hideBackToTop?: boolean;
    /** Offset de scroll à partir du moment ou le menu devient fixe. Par défaut : 100. */
    menuOffset?: number;
    /** Largeur du menu. Par défaut : 250. */
    menuWidth?: boolean;
    /** Comportement du scroll. Par défaut : "smooth" */
    scrollBehaviour?: ScrollBehavior;
    /** Offset entre la position du panel et la position de scroll au clic sur le menu. Par défaut : 150. */
    scrollToOffset?: number;
    /** CSS. */
    theme?: ScrollspyStyle;
}

@autobind
@observer
export class ScrollspyContainer extends React.Component<ScrollspyContainerProps, void> {

    @observable private offsetTop = 0;
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
        this.offsetTop = findDOMNode(this).getBoundingClientRect().top;
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

    @computed
    private get menuPosition() {
        const {menuOffset = 100} = this.props;
        const isFixed = this.offsetTop < menuOffset;
        return {
            position: isFixed ? "fixed" : "absolute",
            top: isFixed ? menuOffset : 0
        };
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
        window.scrollTo({
            top: this.getOffsetTop(node),
            behavior: this.props.scrollBehaviour || "smooth"
        });
    }

    render() {
        const {children, hideBackToTop, menuWidth = 250, scrollBehaviour = "smooth", theme} = this.props;
        return (
            <div className={theme!.scrollspy}>
                <nav style={this.menuPosition}>
                    <ul>
                        {this.menuItems.map(({label, id, onClick}) =>
                            <li className={this.activeItem === id ? theme!.active! : undefined} key={id} onClick={onClick}>{label}</li>
                        )}
                    </ul>
                </nav>
                <div style={{marginLeft: menuWidth}}>
                    {children}
                </div>
                {!hideBackToTop ? <ButtonBackToTop scrollBehaviour={scrollBehaviour} /> : null}
            </div>
        );
    }
}

export default themr("scrollspy", styles)(ScrollspyContainer);
