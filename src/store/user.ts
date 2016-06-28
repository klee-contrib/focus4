import {CoreStore} from "./";

export interface Login {
    login: string;
    password: string;
}

export interface Profile {
    id: string;
    provider: string;
    displayName: string;
    culture: string;
    email: string;
    photo: string;
    firstName: string;
    lastName: string;
}

export const definition = {
    login: {} as Login,
    profile: {} as Profile,
    roles: [] as string[]
};

export default class UserStore extends CoreStore<typeof definition> {
    constructor() {
        super({definition});
    }
}
