import {autobind} from "core-decorators";
import i18n from "i18next";
import {observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {classReaction} from "../util";

import {Message, messageStore} from "./store";

import Icon from "focus-components/icon";
import * as styles from "./__style__/message-center.css";

export type MessageCenterStyle = Partial<typeof styles>;

export interface MessageCenterProps {
    /** Temps en ms d'affichage des messages d'erreur (par défaut: 8000). */
    error?: number;
    /** Préfixe i18n pour l'icône. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Temps en ms d'affichage des messages d'information (par défaut: 3000). */
    info?: number;
    /** Temps en ms d'affichage des messages de succès (par défaut: 3000). */
    success?: number;
    /** Classes CSS. */
    theme?: MessageCenterStyle;
    /** Temps en ms d'affichage des messages d'avertissement (par défaut: 3000). */
    warning?: number;
}

const ANIMATION_LENGTH = 250;

/** Description d'une notification. */
interface Notification {
    type?: string;
    content: string;
    timeout: number;
}

/** Centre de message. Affiche les messages lorsqu'ils sont ajoutés dans le MessageStore. */
@autobind
@observer
export class MessageCenter extends React.Component<MessageCenterProps, void> {

    /** Snackbar affichée ou non. */
    @observable active = false;

    /** Timeout pour fermer la notification. */
    private cleanupTimeout: any = null;
    /** Notification affichée. */
    private currentNotification?: Notification;
    /** Notifications en attente. */
    private queuedNotifications: Notification[] = [];

    /**
     * Gère l'ajout d'un message dans le store.
     * @param message Le message.
     */
    @classReaction(() => messageStore.latestMessage)
    handlePushMessage(message: Message) {
        const {content, type} = message;
        const {error = 8000, info = 3000, success = 3000, warning = 3000} = this.props;
        const timeout = type === "error" ? error : type === "info" ? info : type === "success" ? success : warning;
        this.showSnackbar({type, content, timeout});
    }

    /** Affiche la snackbar avec la notification demandée. */
    private showSnackbar(data: Notification) {
        if (this.active) {
            this.queuedNotifications.push(data);
        } else {
            this.currentNotification = data;
            this.active = true;
            this.cleanupTimeout = setTimeout(this.cleanup, data.timeout);
        }
    }

    /** Force la fermeture du message affiché. */
    private forceCleanup() {
        clearTimeout(this.cleanupTimeout);
        this.cleanup();
    }

    /** Ferme le message affiché. */
    private cleanup() {
        this.cleanupTimeout = null;
        this.active = false;
        setTimeout(this.checkQueue, ANIMATION_LENGTH);
    }

    /** Affiche le message suivant, s'il y en a un. */
    private checkQueue() {
        if (this.queuedNotifications.length > 0) {
            this.showSnackbar(this.queuedNotifications.shift()!);
        }
    }

    render() {
        const {i18nPrefix = "focus", theme} = this.props;
        const {content = "", type = ""} = this.currentNotification || {};
        const otherProps = { "aria-hidden": this.active, "aria-live": "assertive", "aria-atomic": "true", "aria-relevant": "text" };
        return (
            <div className={`${theme!.center!} mdl-snackbar ${this.active ? "mdl-snackbar--active" :  ""} ${type === "error" ? theme!.error! : type === "success" ? theme!.success! : type === "warning" ? theme!.warning! : ""}`} {...otherProps}>
                <div className="mdl-snackbar__text">{content.includes(" ") ? content : i18n.t(content)}</div>
                <button className="mdl-snackbar__close" type="button" onClick={this.forceCleanup}><Icon name={i18n.t(`${i18nPrefix}.icons.messageCenter.clear.name`)} library={i18n.t(`${i18nPrefix}.icons.messageCenter.clear.library` as "material")} /></button>
            </div>
        );
    }
}

export default themr("messageCenter", styles)(MessageCenter);
