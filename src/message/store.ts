import {autobind} from "core-decorators";
import {isString} from "lodash";
import {action, observable} from "mobx";
import {v4} from "uuid";

/** Description d'un message. */
export interface Message {
    id?: string;
    content: string;
    type?: string;
}

/** Store de messages */
@autobind
export class MessageStore {

    /** Objet contenant tous les messages reçus. */
    @observable data: {[id: string]: Message} = {};
    /** Dernier message reçu. */
    @observable latestMessage: Message;

    /**
     * Ajoute un message sans type.
     * @param message Le message.
     */
    @action
    addMessage(message: string | Message) {
        const id = v4();
        this.data[id] = parseString(message);
        this.latestMessage = this.data[id];
    }

    /**
     * Ajoute un message d'avertissement.
     * @param message Le message.
     */
    addWarningMessage(message: string | Message) {
        message = parseString(message);
        message.type = "warning";
        this.addMessage(message);
    }

    /**
     * Ajoute un message d'information.
     * @param message Le message.
     */
    addInformationMessage(message: string | Message) {
        message = parseString(message);
        message.type = "info";
        this.addMessage(message);
    }

    /**
     * Ajoute un message d'erreur.
     * @param message Le message.
     */
    addErrorMessage(message: string | Message) {
        message = parseString(message);
        message.type = "error";
        this.addMessage(message);
    }

    /**
     * Ajoute un message de succès.
     * @param message Le message.
     */
    addSuccessMessage(message: string | Message) {
        message = parseString(message);
        message.type = "success";
        this.addMessage(message);
    }
}

/**
 * Formatte un message entrant.
 * @param message Le message.
 */
function parseString(message: string | Message) {
    if (isString(message)) {
        message = {content: message};
    }
    return message;
}

/** Instance principale du MessageStore. */
export const messageStore = new MessageStore();
