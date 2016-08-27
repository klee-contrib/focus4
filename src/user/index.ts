import {isArray, intersection} from "lodash";

import dispatcher from "dispatcher";

import UserStore, {Login, Profile} from "./store";

function setUserNode(name: string, value: Login | Profile | string[]) {
    dispatcher.handleViewAction({data: {[name]: value}, type: "update"});
}

/**
 * The built-in userStore.
 */
export let builtInStore = new UserStore();

/**
 * Checks if a user has the given role or roles.
 * @param role A role or a list of roles.
 */
export function hasRole(role: string | string[]) {
    role = isArray(role) ? role : [role];
    return 0 < intersection(role, getRoles() || []).length;
}

/**
 * Gets the user login.
 */
export function getLogin() {
     return builtInStore.get<Login>("login");
}

/**
 * Gets the user profile.
 */
export function getProfile() {
    return builtInStore.get<Profile>("profile");
}

/**
 * Gets the user roles.
 */
export function getRoles() {
    return builtInStore.get<string[]>("roles");
}

/**
 * Sets user profile.
 * @param login User login.
 */
export function setLogin(login: Login) {
    setUserNode("login", login);
}

/*
 * Sets the user profile.
 * @param profile User profile.
 */
export function setProfile(profile: Profile) {
    setUserNode("profile", profile);
}

/**
 * Sets the user roles.
 * @param roles User role list.
 */
export function setRoles(roles: string[]) {
    setUserNode("roles", roles);
}
