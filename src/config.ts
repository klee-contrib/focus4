import {AnimationDef} from "popmotion-pose/lib/types";

/** Config Focus de l'application */
export const config = {
    /** Durée de cache par défaut pour les listes de référence. */
    referenceCacheDuration: 3600000, // 1h.

    /** Paramètre des transitions utilisées par react-pose (animations de listes). */
    poseTransition: {type: "spring", stiffness: 170, damping: 26, restDelta: 1, restSpeed: 1000} as AnimationDef,

    /** Délai entre la saisie du texte et la recherche dans la barre de recherche. */
    textSearchDelay: 500
};
