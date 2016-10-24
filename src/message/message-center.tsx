import {autobind} from "core-decorators";
import * as i18n from "i18next";
import {observable, reaction} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {messageStore, Message} from "./store";

import Snackbar from "focus-components/snackbar";

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
        const {content = ""} = this.currentNotification || {};
        return (
            <Snackbar
                content={i18n.t(content)}
                deleteMessage={this.forceCleanup}
            />
        );
    };
}
