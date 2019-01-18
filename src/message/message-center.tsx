import i18next from "i18next";
import {action, observable, reaction} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import * as React from "react";
import {Snackbar} from "react-toolbox/lib/snackbar";

import {messageStore} from "./store";

import * as theme from "./__style__/snackbar.css";

export interface MessageCenterProps {
    /** Temps en ms d'affichage des messages d'erreur (par défaut: 8000). */
    error?: number;
    /** Préfixe i18n pour l'icône. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Temps en ms d'affichage des messages d'information (par défaut: 3000). */
    info?: number;
    /** Temps en ms d'affichage des messages de succès (par défaut: 3000). */
    success?: number;
    /** Temps en ms d'affichage des messages d'avertissement (par défaut: 3000). */
    warning?: number;
}

/** Description d'une notification. */
interface Notification {
    type?: "success" | "error" | "warning" | "info";
    content: string;
    timeout: number;
}

/** Centre de message. Affiche les messages lorsqu'ils sont ajoutés dans le MessageStore. */
@observer
export class MessageCenter extends React.Component<MessageCenterProps> {
    /** Snackbar affichée ou non. */
    @observable active = false;

    /** Notification affichée. */
    private currentNotification?: Notification;
    /** Notifications en attente. */
    private readonly queuedNotifications: Notification[] = [];

    /** Gère l'ajout d'un message dans le store. */
    @disposeOnUnmount
    protected pushMessageHander = reaction(
        () => messageStore.latestMessage!,
        message => {
            const {content, type} = message;
            const {error = 8000, info = 3000, success = 3000, warning = 3000} = this.props;
            const timeout = type === "error" ? error : type === "info" ? info : type === "success" ? success : warning;
            this.showSnackbar({type, content, timeout});
        }
    );

    /** Affiche la snackbar avec la notification demandée. */
    @action.bound
    private showSnackbar(data: Notification) {
        if (this.active) {
            this.queuedNotifications.push(data);
        } else {
            this.currentNotification = data;
            this.active = true;
        }
    }

    /** Ferme le message affiché. */
    @action.bound
    private closeSnackbar() {
        this.active = false;
        setTimeout(() => {
            if (this.queuedNotifications.length > 0) {
                this.showSnackbar(this.queuedNotifications.shift()!);
            }
        }, 550); // Le temps qu'il faut pour fermer la snackbar
    }

    render() {
        const {i18nPrefix = "focus"} = this.props;
        const {content, timeout, type} = this.currentNotification || {content: "", type: undefined, timeout: 0};
        return (
            <Snackbar
                action={i18next.t(`${i18nPrefix}.messageCenter.dismiss`)}
                active={this.active}
                label={i18next.t(content)}
                onClick={this.closeSnackbar}
                onTimeout={this.closeSnackbar}
                timeout={timeout}
                theme={theme}
                type={
                    type === "error" ? "cancel" : type === "success" ? "accept" : type === "warning" ? type : undefined
                }
            />
        );
    }
}
