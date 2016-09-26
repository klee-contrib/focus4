import {autobind} from "core-decorators";
import {isString} from "lodash";
import {observable, action} from "mobx";
import {v4} from "node-uuid";

export interface Message {
    id?: string;
    content: string;
    type?: string;
}

@autobind
export class MessageStore {

    @observable data: {[id: string]: Message} = {};
    @observable latestMessage: Message;

    @action
    addMessage(message: string | Message) {
        const id = v4();
        this.data[id] = parseString(message);
        this.latestMessage = this.data[id];
    }

    addWarningMessage(message: string | Message) {
        message = parseString(message);
        message.type = "warning";
        this.addMessage(message);
    }

    addInformationMessage(message: string | Message) {
        message = parseString(message);
        message.type = "info";
        this.addMessage(message);
    }

    addErrorMessage(message: string | Message) {
        message = parseString(message);
        message.type = "error";
        this.addMessage(message);
    }

    addSuccessMessage(message: string | Message) {
        message = parseString(message);
        message.type = "success";
        this.addMessage(message);
    }
}

function parseString(message: string | Message) {
    if (isString(message)) {
        message = {content: message};
    }
    return message;
}

/** Instance principale du MessageStore. */
export const messageStore = new MessageStore();
