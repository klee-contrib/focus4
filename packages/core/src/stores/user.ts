import {intersection} from "es-toolkit";
import {makeObservable, observable} from "mobx";

/** Store utilisateur de base, standardisant la gestion des rôles. A étendre pour y ajouter du métier. */
export class UserStore<Role extends string = string> {
    /** Liste des roles de l'utilisateur connecté. */
    @observable roles = [] as Role[];

    constructor() {
        makeObservable(this);
    }

    /**
     * Vérifie si un utilisateur possède l'un des rôles proposés.
     * @param roles Les rôles proposés.
     */
    hasRole(...roles: Role[]) {
        return intersection(roles, this.roles || []).length > 0;
    }
}
