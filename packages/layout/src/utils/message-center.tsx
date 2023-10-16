import i18next from "i18next";
import {action} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {useCallback, useEffect} from "react";

import {messageStore} from "@focus4/core";
import {Snackbar} from "@focus4/toolbox";

export interface MessageCenterProps {
    /** Types de messages à afficher dans le message center avec leur durée d'affichage en ms. Par défaut : "success", "error", "info" et "warning", tous à 3000 sauf "error" à 8000. */
    messageTypes?: Record<string, number>;
    /** Préfixe i18n pour le label de fermeture. Par défaut : "focus". */
    i18nPrefix?: string;
}

/** Description d'une notification. */
interface Notification {
    type?: string;
    message: string;
    timeout: number;
}

/** Centre de message. Affiche les messages lorsqu'ils sont ajoutés dans le MessageStore. */
export function MessageCenter({
    messageTypes = {success: 3000, error: 8000, info: 3000, warning: 3000},
    i18nPrefix = "focus"
}: MessageCenterProps) {
    const state = useLocalObservable(() => ({
        /** Snackbar affichée ou non. */
        active: false,

        /** Notifications en attente. */
        queuedNotifications: [] as Notification[],

        /** Notification en cours. */
        get currentNotification() {
            return this.queuedNotifications[0] ?? {message: "", type: undefined, timeout: 0};
        }
    }));

    useEffect(
        () =>
            messageStore.addMessageListener(
                Object.keys(messageTypes),
                action((type, message) => {
                    state.active = true;
                    state.queuedNotifications.push({type, message, timeout: messageTypes[type]});
                })
            ),
        (Object.keys(messageTypes) as unknown[]).concat(Object.values(messageTypes))
    );

    const closeSnackbar = useCallback(
        action(() => {
            state.active = false;
            setTimeout(() => {
                state.queuedNotifications.shift();
                if (state.queuedNotifications.length) {
                    state.active = true;
                }
            }, 550); // Le temps qu'il faut pour fermer la snackbar
        }),
        []
    );

    return useObserver(() => (
        <Snackbar
            action={i18next.t(`${i18nPrefix}.messageCenter.dismiss`)}
            active={state.active}
            label={i18next.t(state.currentNotification.message)}
            onClick={closeSnackbar}
            onTimeout={closeSnackbar}
            timeout={state.currentNotification.timeout}
            type={
                state.currentNotification.type === "error"
                    ? "cancel"
                    : state.currentNotification.type === "success"
                    ? "accept"
                    : state.currentNotification.type === "warning"
                    ? "warning"
                    : undefined
            }
        />
    ));
}
