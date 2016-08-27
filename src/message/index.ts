import {isString} from "lodash";

import dispatcher from "dispatcher";

import MessageStore, {Message} from "./store";

function parseString(message: string | Message) {
    if (isString(message)) {
        message = {content: message};
    }
    return message;
}

/**
 * Add a message.
 * @param message The message content.
 */
export function addMessage(message: string | Message) {
    dispatcher.handleServerAction({
        data: {message},
        type: "push"
    });
}

/**
 * Add a warning message.
 * @param message The message content.
 */
export function addWarningMessage(message: string | Message) {
    message = parseString(message);
    message.type = "warning";
    addMessage(message);
}

/**
 * Add an information message.
 * @param message The message content.
 */
export function addInformationMessage(message: string | Message) {
    message = parseString(message);
    message.type = "info";
    addMessage(message);
}

/**
 * Add an error message.
 * @param message The message content.
 */
export function addErrorMessage(message: string | Message) {
    message = parseString(message);
    message.type = "error";
    addMessage(message);
}

/**
 * Add a success message.
 * @param message The message content.
 */
export function addSuccessMessage(message: string | Message) {
    message = parseString(message);
    message.type = "success";
    addMessage(message);
}

/**
 * The message store
 */
export let builtInStore = new MessageStore();

/**
 * Clear all the messages
 */
export function clearMessages() {
    dispatcher.handleServerAction({data: {messages: {}}, type: "clear"});
}
