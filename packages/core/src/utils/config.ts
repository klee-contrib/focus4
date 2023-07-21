/** Config Focus de l'application */
export const config = {
    /** Valeur de "autocomplete" sur les inputs pour lesquels on ne veut pas d'autocomplétion. */
    autocompleteOffValue: "off",

    /** Durée de cache par défaut pour les listes de référence. */
    referenceCacheDuration: 3600000, // 1h.

    /** Nombre de tentatives de fetch supplémentaires après un "Failed to fetch" */
    retryCountOnFailedFetch: 2,

    /** Délai avant la tentative suivante de fetch après un "Failed to fetch" */
    retryDelayOnFailedFetch: 300,

    /** Délai entre la saisie du texte et la recherche dans la barre de recherche. */
    textSearchDelay: 500
};
