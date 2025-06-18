/** Config Focus de l'application */
export const uiConfig = {
    /** Valeur de "autocomplete" sur les inputs pour lesquels on ne veut pas d'autocomplétion. */
    autocompleteOffValue: /Firefox/.test(navigator.userAgent) ? "off" : "one-time-code",

    /** Classe CSS par défaut des icônes. */
    defaultIconClassName: "material-symbols-outlined"
};
