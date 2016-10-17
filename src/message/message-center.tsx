import {autobind} from "core-decorators";
import i18n = require("i18next");
import {observable, reaction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {messageStore, Message} from "./store";

export interface MessageCenterProps {
    error?: number;
    info?: number;
    success?: number;
    warning?: number;
}

const ANIMATION_LENGTH = 250;

type Notification = {type?: string, content: string, timeout: number};

@autobind
@observer
export class MessageCenter extends React.Component<MessageCenterProps, void> {

    static defaultProps = {
        error: 8000,
        info: 3000,
        success: 3000,
        warning: 3000
    };

    @observable active = false;

    private cleanupTimeout: any = null;
    private currentNotification?: Notification;
    private queuedNotifications: Notification[] = [];
    private reaction: any;

    componentWillMount() {
        this.reaction = reaction(() => messageStore.latestMessage, this.handlePushMessage);
    }

    componentWillUnmount() {
        this.reaction();
    }

    checkQueue() {
        if (this.queuedNotifications.length > 0) {
            this.showSnackbar(this.queuedNotifications.shift()!);
        }
    }

    forceCleanup() {
        clearTimeout(this.cleanupTimeout);
        this.cleanup();
    }

    cleanup() {
        this.cleanupTimeout = null;
        this.active = false;
        setTimeout(this.checkQueue, ANIMATION_LENGTH);
    }

    handlePushMessage(message: Message) {
        const {content, type} = message;
        const {error, info, success, warning} = this.props;
        const timeout = type === "error" ? error! : type === "info" ? info! : type === "success" ? success! : warning!;
        this.showSnackbar({type, content, timeout});
    }

    private showSnackbar(data: Notification) {
        if (this.active) {
            this.queuedNotifications.push(data);
        } else {
            this.currentNotification = data;
            this.active = true;
            this.cleanupTimeout = setTimeout(this.cleanup, data.timeout);
        }
    }

    render() {
        const {content = "", type = undefined} = this.currentNotification || {};
        const classNames = `mdl-snackbar ${this.active ? "mdl-snackbar--active" :  ""}`;
        const otherProps = { "aria-hidden": this.active, "aria-live": "assertive", "aria-atomic": "true", "aria-relevant": "text" };
        return (
            <div data-focus="snackbar-message-center" data-message-type={type} className={classNames} {...otherProps}>
                <div className="mdl-snackbar__text">{i18n.t(content)}</div>
                <button className="mdl-snackbar__close" type="button" onClick={this.forceCleanup}><i className="material-icons">clear</i></button>
            </div>
        );
    };
}
