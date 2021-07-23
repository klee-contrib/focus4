import i18next from "i18next";
import {action, IReactionDisposer, makeObservable, observable, reaction} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import {Component} from "react";

import {messageStore} from "@focus4/core";
import {Snackbar} from "@focus4/toolbox";

import snackBarCss from "./__style__/snackbar.css";
export {snackBarCss};

export interface MessageCenterProps {
    /** Temps en ms d'affichage des messages d'erreur (par défaut: 8000). */
    errorDuration?: number;
    /** Préfixe i18n pour le label de fermeture. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Temps en ms d'affichage des messages d'information (par défaut: 3000). */
    infoDuration?: number;
    /** Temps en ms d'affichage des messages de succès (par défaut: 3000). */
    successDuration?: number;
    /** Temps en ms d'affichage des messages d'avertissement (par défaut: 3000). */
    warningDuration?: number;
}

/** Description d'une notification. */
interface Notification {
    type?: "success" | "error" | "warning" | "info";
    content: string;
    timeout: number;
}

/** Centre de message. Affiche les messages lorsqu'ils sont ajoutés dans le MessageStore. */
@observer
export class MessageCenter extends Component<MessageCenterProps> {
    /** Snackbar affichée ou non. */
    @observable active = false;

    /** Notification affichée. */
    private currentNotification?: Notification;
    /** Notifications en attente. */
    private readonly queuedNotifications: Notification[] = [];

    /** Gère l'ajout d'un message dans le store. */
    @disposeOnUnmount
    protected pushMessageHander: IReactionDisposer = reaction(
        () => messageStore.latestMessage!,
        message => {
            const {content, type} = message;
            const {
                errorDuration = 8000,
                infoDuration = 3000,
                successDuration = 3000,
                warningDuration = 3000
            } = this.props;
            const timeout =
                type === "error"
                    ? errorDuration
                    : type === "info"
                    ? infoDuration
                    : type === "success"
                    ? successDuration
                    : warningDuration;
            this.showSnackbar({type, content, timeout});
        }
    );

    constructor(props: MessageCenterProps) {
        super(props);
        makeObservable(this);
    }

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
        const {content, timeout, type} = this.currentNotification ?? {content: "", type: undefined, timeout: 0};
        return (
            <Snackbar
                action={i18next.t(`${i18nPrefix}.messageCenter.dismiss`)}
                active={this.active}
                label={i18next.t(content)}
                onClick={this.closeSnackbar}
                onTimeout={this.closeSnackbar}
                theme={snackBarCss}
                timeout={timeout}
                type={
                    type === "error" ? "cancel" : type === "success" ? "accept" : type === "warning" ? type : undefined
                }
            />
        );
    }
}
