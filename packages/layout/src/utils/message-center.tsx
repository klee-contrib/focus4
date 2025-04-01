import {action} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {useCallback, useEffect} from "react";
import {useTranslation} from "react-i18next";

import {Message, messageStore} from "@focus4/core";
import {Snackbar} from "@focus4/toolbox";

export interface MessageCenterProps {
    /** Types de messages à afficher dans le message center avec leur durée d'affichage en ms. Par défaut : "success", "error", "info" et "warning", tous à 3000 sauf "error" à 8000. */
    messageTypes?: Record<string, number>;
}

interface Notification {
    type?: string;
    message: Message;
    timeout: number;
}

/** Centre de message. Affiche les messages lorsqu'ils sont ajoutés dans le MessageStore. */
export function MessageCenter({
    messageTypes = {success: 3000, error: 8000, info: 3000, warning: 3000}
}: MessageCenterProps) {
    const {t} = useTranslation();

    const state = useLocalObservable(() => ({
        active: false,
        notifications: [] as Notification[],
        timeout: undefined as NodeJS.Timeout | undefined
    }));

    const open = useCallback(function open(timeout: number) {
        state.active = true;
        state.timeout = setTimeout(close, timeout);
    }, []);

    const close = useCallback(function close() {
        clearTimeout(state.timeout);
        state.active = false;
    }, []);

    const onClose = useCallback(function onClose() {
        state.notifications.shift();
        if (state.notifications.length) {
            open(state.notifications[0].timeout);
        }
    }, []);

    useEffect(
        () =>
            messageStore.addMessageListener(
                Object.keys(messageTypes),
                action((type, message) => {
                    if (!state.notifications.length) {
                        open(messageTypes[type]);
                    }
                    state.notifications.push({type, message, timeout: messageTypes[type]});
                })
            ),
        (Object.keys(messageTypes) as unknown[]).concat(Object.values(messageTypes))
    );

    return useObserver(() => (
        <Snackbar
            action={state.notifications[0]?.message.action}
            active={state.active}
            close={close}
            level={
                state.notifications[0]?.type === "error" ||
                state.notifications[0]?.type === "success" ||
                state.notifications[0]?.type === "warning"
                    ? state.notifications[0]?.type
                    : undefined
            }
            message={t(state.notifications[0]?.message.label ?? "")}
            onClose={onClose}
        />
    ));
}
