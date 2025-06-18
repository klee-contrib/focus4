/** Paramètre de type number. */
export interface NumberParam<N extends number = number> {
    type: "number";
    required: boolean;
    spec: N;
}

/** Paramètre de type string. */
export interface StringParam<S extends string = string> {
    type: "string";
    required: boolean;
    spec: S;
}

/** Paramètre (number ou string). */
export type Param<T extends number | string> = T extends number
    ? NumberParam<T>
    : T extends string
      ? StringParam<T>
      : never;

/** Définition d'un paramètre : nom, type et routes suivantes. */
export type ParamDef<K extends string, P extends NumberParam | StringParam, V = unknown> = [K, P, V?];

/** Builder pour un type de paramètre. */
export interface ParamTypeBuilder {
    /**
     * Spécifie un type number pour un paramètre.
     * @param required Paramètre obligatoire.
     */
    number<N extends number>(required?: boolean): NumberParam<N>;
    /**
     * Spécifie un type string pour un paramètre.
     * @param required Paramètre obligatoire.
     */
    string<S extends string>(required?: boolean): StringParam<S>;
}

const paramTypeBuilder: ParamTypeBuilder = {
    number<N extends number>(required = false): NumberParam<N> {
        return {type: "number", required, spec: {} as N};
    },
    string<S extends string>(required = false): StringParam<S> {
        return {type: "string", required, spec: {} as S};
    }
};

/**
 * Crée une définition de paramètre dans le routeur. A utiliser dans `makeRouter`.
 *
 * Un paramètre à un nom, un type (`number` ou `string`) et peut être obligatoire ou non. Si le paramètre est obligatoire, alors la section de route
 * le précédant ne pourra pas être atteinte si le paramètre n'est pas renseigné.
 *
 * Les sections de route suivant le paramètres se précisent en troisième paramètre de cette fonction.
 * @param name Nom du paramètre.
 * @param type Type du paramètre.
 * @param next Suite de la route.
 */
export function param<K extends string, P extends NumberParam | StringParam, V>(
    name: K,
    type: (b: ParamTypeBuilder) => P,
    next?: V
): ParamDef<K, P, V> {
    return [name, type(paramTypeBuilder), next];
}
