import numeral from "numeral";

/**
 * Formatte un nombre.
 * @param n Le nombre à formatter.
 * @param format Le format (par défaut: "0.0").
 */
export function formatNumber(n: string | number, format?: string) {
    format = format || "0,0";
    return numeral(n).format(format);
}
