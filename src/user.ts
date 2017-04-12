import {intersection, isArray} from "lodash";
import {observable} from "mobx";

/** Description du login de l'utilisateur connecté. */
export interface Login {
    login?: string;
    password?: string;
}

/** Description du profil de l'utilisateur connecté. */
export interface Profile {
    id?: string;
    provider?: string;
    displayName?: string;
    culture?: string;
    email?: string;
    photo?: string;
    firstName?: string;
    lastName?: string;
}

export class UserStore {

    /** Objet contenant les infos de login de l'utilisateur connecté. */
    @observable login = {} as Login;

    /** Objet contenant les infos de profil de l'utilisateur connecté. */
    @observable profile = {} as Profile;

    /** Liste des roles de l'utilisateur connecté. */
    @observable roles = [] as string[];

    /**
     * Vérifie si un utilisateur possède l'un des rôles proposés.
     * @param role Un rôle ou un tableau de rôles.
     */
    hasRole(role: string | string[]) {
        role = isArray(role) ? role : [role];
        return 0 < intersection(role, this.roles || []).length;
    }
}

/** Instance principale du UserStore. */
export const userStore = new UserStore();
