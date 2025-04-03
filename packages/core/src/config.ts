/** Config Focus de l'application */
export const coreConfig = {
    /** Durée de cache par défaut pour les listes de référence. */
    referenceCacheDuration: 3600000, // 1h.

    /** Nombre de tentatives de fetch supplémentaires après un "Failed to fetch" */
    retryCountOnFailedFetch: 2,

    /** Délai avant la tentative suivante de fetch après un "Failed to fetch" */
    retryDelayOnFailedFetch: 300,

    /**
     * Renseigne le header `Accept-Language` par défaut de `coreFetch` pour utiliser la langue choisie dans `i18next`.
     *
     * (Sans ce header, le navigateur en posera un automatiquement, selon la langue de l'utilisateur).
     */
    useI18nextAcceptHeader: false
};
