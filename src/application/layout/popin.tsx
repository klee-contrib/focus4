import {autobind} from "core-decorators";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";
import {findDOMNode} from "react-dom";

import Button from "focus-components/button";

import * as styles from "./__style__/popin.css";
export {styles};

export type PopinStyle = Partial<typeof styles>;

export interface PopinProps {
    level?: number;
    closePopin: () => void;
    opened: boolean;
    theme?: PopinStyle;
    type?: "from-right" | "from-left" | "center";
}

@themr("popin", styles)
@autobind
@observer
export class Popin extends React.Component<PopinProps, {}> {

    private openTimeoutID: any;

    @observable opened = false;
    @observable willOpen = false;
    @observable willClose = false;

    componentWillUnmount() {
        window.clearTimeout(this.openTimeoutID);
        if (this.opened || this.willOpen) {
            this.restoreBodyOverflow();
        }
    }

    componentWillMount() {
        if (this.props.opened) {
            this.toggleOpen(this.props.opened);
        }
    }

    componentWillReceiveProps({opened}: PopinProps) {
        if (opened !== this.props.opened) {
            this.toggleOpen(opened);
        }
    }

    private toggleOpen(opened: boolean) {
        if (opened) {
            this.willOpen = true;
            this.openTimeoutID = setTimeout(() => this.willOpen = false, 200);
            this.opened = true;
            this.hideBodyOverflow();
        } else {
            this.willClose = true;
            this.restoreBodyOverflow();
            this.openTimeoutID = setTimeout(() => {
                this.opened = false;
                this.willClose = false;
            }, 200);
        }
    }

    private hideBodyOverflow() {
        if (this.props.level) {
            let parentPopin = findDOMNode(this) as HTMLElement | null;
            while (parentPopin && parentPopin.getAttribute("data-level") !== `${this.props.level - 1}`) {
                parentPopin = parentPopin.parentElement;
            }
            if (parentPopin) {
                parentPopin.style.overflowY = "hidden";
                return;
            }
        }

        document.body.style.overflowY = "hidden";
    }

    private restoreBodyOverflow() {
        if (this.props.level) {
            let parentPopin = findDOMNode(this) as HTMLElement | null;
            while (parentPopin && parentPopin.getAttribute("data-level") !== `${this.props.level - 1}`) {
                parentPopin = parentPopin.parentElement;
            }
            if (parentPopin) {
                parentPopin.style.overflowY = "auto";
                return;
            }
        }

        document.body.style.overflowY = "auto";
    }

    private get animations() {
        const {type = "from-right"} = this.props;
        switch (type) {
            case "from-right":
                return {
                    open: "slideInRight",
                    close: "slideOutRight"
                };
            case "from-left":
                return {
                    open: "slideInLeft",
                    close: "slideOutLeft"
                };
            case "center":
                return {
                    open: "zoomIn",
                    close: "zoomOut"
                };
            default:
                return {open: "", close: ""};
        }
    }

    render() {
        const {level = 0, children, closePopin, theme, type = "from-right"} = this.props;
        const {open, close} = this.animations;
        return this.opened ?
            <div>
                <div
                    className={`${theme!.overlay!} animated ${this.willClose ? "fadeOut" : this.willOpen ? "fadeIn" : ""}`}
                    onClick={closePopin}
                    style={level > 0 ? {background: "none"} : {}}
                />
                <div
                    data-level={level}
                    className={`${theme!.popin!} ${type === "from-right" ? theme!.right! : type === "from-left" ? theme!.left! : type === "center" ? theme!.center! : ""} animated ${this.willClose ? close : this.willOpen ? open : ""}`}
                    onClick={e => e.stopPropagation()}
                >
                    {type !== "center" ? <Button icon="close" shape="mini-fab" onClick={closePopin} /> : null}
                    <div>{children}</div>
                </div>
            </div>
        : <div />;
    }
}
