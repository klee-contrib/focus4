import {lowerFirst} from "es-toolkit";
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
    private readonly _listeners = new Map<string, MessageListener[]>();
    private readonly _messages = observable.map<string, Message[]>();

    /** Types de messages à traiter dans un appel à `addMessages`.  */
    messageTypes = ["success", "error", "info", "warning"];

    /** Retourne tous les messages enregistrés dans le store. */
    get messages() {
        return new Map(this._messages);
    }

    /**
     * Ajoute un message.
     * @param type Le type
     * @param message Le message.
     */
    addMessage(type: string, message: string): void;
    addMessage(type: string, message: Message): void;
    @action.bound
    addMessage(type: string, message: Message | string) {
        if (!this._messages.get(type)) {
            this._messages.set(type, []);
        }

        if (typeof message === "string") {
            message = {label: message};
        }

        this._messages.get(type)!.push(message);
        for (const listener of this._listeners.get(type) ?? []) {
            listener(type, message);
        }
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
        const allMessages: {type: string; message: string}[] = [];

        for (const type in messages) {
            const possibleTypes = [
                type,
                type.endsWith("s") ? type.slice(0, -1) : "",
                type.startsWith("global") ? lowerFirst(type.slice(6)) : "",
                type.startsWith("global") && type.endsWith("s") ? lowerFirst(type.slice(6, -1)) : ""
            ].filter(Boolean);

            for (const possibleType of possibleTypes) {
                if (this.messageTypes.includes(possibleType)) {
                    for (const message of Array.isArray(messages[type]) ? messages[type] : [messages[type]]) {
                        this.addMessage(possibleType, message);
                        allMessages.push({type: possibleType, message});
                    }
                }
            }
        }

        return allMessages;
    }

    /**
     * Enregistre un listener pour être notifié de l'ajout de messages dans le store
     * @param types Les types de message
     * @param listener Le callback.
     */
    addMessageListener(types: string[], listener: MessageListener) {
        for (const type of types) {
            if (!this._listeners.get(type)) {
                this._listeners.set(type, []);
            }

            this._listeners.get(type)!.push(listener);
        }

        return () => {
            for (const type of types) {
                this._listeners.set(type, this._listeners.get(type)?.filter(l => l !== listener) ?? []);
            }
        };
    }

    /**
     * Vide les messages du store.
     * @param type Type de message à vider. Si non renseigné : vide tous les messages.
     */
    clearMessages(type?: string) {
        if (!type) {
            this._messages.clear();
        } else {
            this._messages.set(type, []);
        }
    }

    /** Récupère le dernier message du type demandé. */
    getLatestMessage(type: string) {
        return (this._messages.get(type) ?? []).at(-1);
    }
}

/** Instance principale du MessageStore. */
export const messageStore = new MessageStore();
