import {lowerFirst} from "lodash";
import {action, observable} from "mobx";

export interface Message {
    label: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export type MessageListener = (type: string, message: Message) => void;

/** Store de messages */
export class MessageStore {
    private readonly messages = observable.map<string, Message[]>();
    private readonly listeners = new Map<string, MessageListener[]>();

    /** Types de messages à traiter dans un appel à `addMessages`.  */
    messageTypes = ["success", "error", "info", "warning"];

    /**
     * Ajoute un message.
     * @param type Le type
     * @param message Le message.
     */
    addMessage(type: string, message: string): void;
    addMessage(type: string, message: Message): void;
    @action.bound
    addMessage(type: string, message: Message | string) {
        if (!this.messages.get(type)) {
            this.messages.set(type, []);
        }

        if (typeof message === "string") {
            message = {label: message};
        }

        this.messages.get(type)!.push(message);
        (this.listeners.get(type) ?? []).forEach(listener => listener(type, message as Message));
    }

    /**
     * Ajoute un message d'avertissement.
     * @param message Le message.
     */
    addWarningMessage(message: string): void;
    addWarningMessage(message: Message): void;
    @action.bound
    addWarningMessage(message: Message | string) {
        this.addMessage("warning", message as Message);
    }

    /**
     * Ajoute un message d'information.
     * @param message Le message.
     */
    addInformationMessage(message: string): void;
    addInformationMessage(message: Message): void;
    @action.bound
    addInformationMessage(message: Message | string) {
        this.addMessage("info", message as Message);
    }

    /**
     * Ajoute un message d'erreur.
     * @param message Le message.
     */
    addErrorMessage(message: string): void;
    addErrorMessage(message: Message): void;
    @action.bound
    addErrorMessage(message: Message | string) {
        this.addMessage("error", message as Message);
    }

    /**
     * Ajoute un message de succès.
     * @param message Le message.
     */
    addSuccessMessage(message: string): void;
    addSuccessMessage(message: Message): void;
    @action.bound
    addSuccessMessage(message: Message | string) {
        this.addMessage("success", message as Message);
    }

    /**
     * Ajoute en masse des messages dans le store. Seuls les types listés dans `messageTypes` seront pris en compte.
     * Les noms de types peuvent égalements être au pluriel et/ou être préfixés par "global".
     *
     * Exemple : `error`/`errors`/`globalError`/`globalErrors` seront tous les 4 pris en compte pour ajouter des messages de type `error`.
     *
     * `addMessages` est automatiquement appelé par `coreFetch` en cas d'erreur.
     * @param messages Objet faisant correspondre à chaque type le ou les messages à ajouter.
     */
    @action.bound
    addMessages(messages: Record<string, string[] | string>) {
        const allMessages: string[] = [];

        Object.keys(messages).forEach(type => {
            const possibleTypes = [
                type,
                type.endsWith("s") ? type.substring(0, type.length - 1) : "",
                type.startsWith("global") ? lowerFirst(type.substring(6, type.length)) : "",
                type.startsWith("global") && type.endsWith("s") ? lowerFirst(type.substring(6, type.length - 1)) : ""
            ].filter(Boolean);

            possibleTypes.forEach(possibleType => {
                if (this.messageTypes.includes(possibleType)) {
                    (Array.isArray(messages[type]) ? (messages[type] as string[]) : [messages[type] as string]).forEach(
                        message => {
                            this.addMessage(possibleType, message);
                            allMessages.push(message);
                        }
                    );
                }
            });
        });

        return allMessages;
    }

    /**
     * Enregistre un listener pour être notifié de l'ajout de messages dans le store
     * @param types Les types de message
     * @param listener Le callback.
     */
    addMessageListener(types: string[], listener: MessageListener) {
        types.forEach(type => {
            if (!this.listeners.get(type)) {
                this.listeners.set(type, []);
            }

            this.listeners.get(type)!.push(listener);
        });

        return () => {
            types.forEach(type => {
                this.listeners.set(type, this.listeners.get(type)?.filter(l => l !== listener) ?? []);
            });
        };
    }

    /** Récupère le dernier message du type demandé. */
    getLatestMessage(type: string) {
        return (this.messages.get(type) ?? []).slice(-1).pop();
    }
}

/** Instance principale du MessageStore. */
export const messageStore = new MessageStore();
