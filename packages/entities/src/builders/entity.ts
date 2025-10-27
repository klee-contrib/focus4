import {Entity} from "../types";

/**
 * Crée une entité à partir d'une définition d'entrées.
 *
 * La seule valeur ajoutée de cette fonction (pour l'instant) est de renseigner automatiquement le nom des champs créés.
 */
export function entity<const E extends Entity>(entries: E): E {
    for (const key in entries) {
        if (entries[key].type === "field" && !entries[key].name) {
            (entries[key] as any).name = key;
        }
    }

    return entries;
}
