/** Config Focus de l'application */
export const coreConfig = {
    /** Durée de cache par défaut pour les listes de référence. */
    referenceCacheDuration: 3_600_000, // 1h.

    /**
     * Renseigne le header `Accept-Language` par défaut de `coreFetch` pour utiliser la langue choisie dans `i18next`.
     *
     * (Sans ce header, le navigateur en posera un automatiquement, selon la langue de l'utilisateur).
     */
    useI18nextAcceptHeader: false
};
