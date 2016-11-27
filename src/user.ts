import {intersection, isArray} from "lodash";
import {observable} from "mobx";

export interface Login {
    login?: string;
    password?: string;
}

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
    @observable login = {} as Login;
    @observable profile = {} as Profile;
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
