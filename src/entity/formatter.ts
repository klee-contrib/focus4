import numeral from "numeral";

/**
 * Formatte un nombre.
 * @param n Le nombre à formatter.
 * @param format Le format (par défaut: "0.0").
 */
export function formatNumber(n: string, format?: string) {
    format = format || "0,0";
    return numeral(n).format(format);
};

/**
 * Définit le langage à utiliser pour les formatteurs.
 * @param key La clé du langage.
 * @param numeralConf La conf de numeral.js.
 */
export function setLanguage(key: string, numeralConf: any) {
    return numeral.register("locale", key, numeralConf);
}
