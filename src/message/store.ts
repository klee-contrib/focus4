import {EventEmitter} from "events";
import {Map} from "immutable";
import {v4} from "node-uuid";

import dispatcher from "dispatcher";

export interface Message {
    id?: string;
    content: string;
    type?: string;
}

export default class MessageStore extends EventEmitter {

    private dispatch: string;
    private data = Map<string, Message>({});

    getMessage(messageId: string) {
        if (!this.data.has(messageId)) {
            return undefined;
        }
        return this.data.get(messageId);
    }

    deleteMessage(messageId: string) {
        if (this.data.has(messageId)) {
            this.data = this.data.delete(messageId);
        }
    }

    pushMessage(message: Message) {
        const id = v4();
        this.data = this.data.set(id, Object.assign({id}, message));
        this.emit("push", id);
    }

    clearMessages() {
        this.data = this.data.clear();
        this.emit("clear");
    }

    addPushedMessageListener(cb: Function) {
        this.addListener("push", cb);
    }

    removePushedMessageListener(cb: Function) {
        this.removeListener("push", cb);
    }

    addClearMessagesListener(cb: Function) {
        this.addListener("clear", cb);
    }

    removeClearMessagesListener(cb: Function) {
        this.removeListener("clear", cb);
    }

    registerDispatcher() {
        this.dispatch = dispatcher.register(transferInfo => {
            const {data, type} = transferInfo.action;
            if (data) {
                switch (type) {
                    case "push":
                        if (data["message"]) {
                            this.pushMessage(data["message"]);
                        }
                        break;
                    case "clear":
                        if (data["messages"]) {
                            this.clearMessages();
                        }
                        break;
                }
            }
        });
    }
}
