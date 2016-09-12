import i18next = require("i18next");

export function init(options?: i18next.Options, callback?: (err: any, t: i18next.TranslationFunction) => void) {
    i18next.init(options, callback);
}

export function translate(key: string, options?: i18next.TranslationOptions) {
    return i18next.t(key, options);
}
