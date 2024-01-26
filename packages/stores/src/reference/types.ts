/** Définition d'un type de référence. */
export interface ReferenceDefinition<T = any, VK extends keyof T = any, LK extends keyof T = any> {
    /** Propriété représentant le libellé. */
    labelKey: LK;
    /** Le type de la liste. */
    type: T;
    /** Propriété représentant la valeur. */
    valueKey: VK;
}

export interface ReferenceList<T = any, VK extends keyof T = any, LK extends keyof T = any> extends Array<T> {
    /** Propriété représentant le libellé. */
    $labelKey: LK;
    /** Propriété représentant la valeur. */
    $valueKey: VK;
    /**
     * Obtient le libellé d'un item à partir de la valeur.
     * @param value Valeur de l'item.
     */
    getLabel(value: T[VK] | undefined): T[LK] | undefined;
    /**
     * Surcharge de Array.prototype.filter pour retourner une ReferenceList avec les mêmes propriétés.
     * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
     */
    filter(callbackfn: (value: T, index: number, array: T[]) => unknown): ReferenceList<T, VK, LK>;
}

/** Mapping de type pour transformer les types d'entrée en liste de ces même types. */
export type AsList<T extends Record<string, ReferenceDefinition>> = {
    [P in keyof T]: ReferenceList<T[P]["type"], T[P]["valueKey"], T[P]["labelKey"]>;
};

/** Store de référence. */
export type ReferenceStore<T extends Record<string, ReferenceDefinition>> = AsList<T> & {
    /**
     * Récupère une liste de référence, depuis le serveur si nécessaire.
     * @param refName Liste de référence demandée.
     */
    get<K extends string & keyof T>(refName?: K): Promise<AsList<T>[K]>;

    /** Si l'une des listes de référence est en cours de chargement. */
    readonly isLoading: boolean;

    /**
     * Recharge une liste ou le store.
     * @param refName L'éventuelle liste demandée.
     */
    reload(refName?: keyof T): Promise<void>;

    /**
     * Ajoute un (ou plusieurs) id(s) de suivi donné au chargement des listes de référence demandées.
     *
     * Cela permettra d'ajouter l'état de chargement au `isLoading` de cet(ces) id(s).
     * @param trackingIds Id(s) de suivi.
     * @param refNames Listes de références. Si non renseigné, suit toutes les listes de référence.
     */
    track(trackingIds: string[] | string, ...refNames: (keyof T)[]): () => void;
};
