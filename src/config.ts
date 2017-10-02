import {ComponentClass, SFC} from "react";

/** Config Focus de l'application */
export const config = {

    /** Durée de cache par défaut pour les listes de référence. */
    referenceCacheDuration: 3600000, // 1h.

    /** Délai entre la saisie du texte et la recherche dans la barre de recherche. */
    textSearchDelay: 500
};

/** Composant React avec props. */
export type ReactComponent<P> = ComponentClass<P> | SFC<P>;
