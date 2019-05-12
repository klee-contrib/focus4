import {disposeOnUnmount} from "??";
import i18next from "i18next";
import {isFunction} from "lodash";
import {action, comparer, computed, extendObservable, Lambda, observable, reaction, runInAction} from "mobx";

import {PanelProps} from "../../../../../src/components";
import {messageStore} from "../../../../../src/message";

import {FormProps} from "../../../../../src/entity/form/form";
import {toFlatValues} from "../store";
import {Entity, EntityToType, FormListNode, FormNode, isStoreNode} from "../types";

/** Configuration additionnelle du formulaire.. */
export interface FormConfig<S extends string = "default"> {
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Appelé au clic sur le bouton "Annuler". */
    onClickCancel?: () => void;
    /** Appelé au clic sur le bouton "Modifier". */
    onClickEdit?: () => void;
    /** Appelé en cas d'erreur pendant la sauvgarde. */
    onFormError?: (e: any) => void;
    /** Appelé après le chargement. */
    onFormLoaded?: () => void;
    /** Appelé après la sauvegarde. */
    onFormSaved?: (save: S) => void;
    /** Utilise le nom du save dans le message de succès de la sauvegarde (prefix.detail.saved => prefix.detail.name.saved). */
    useSaveNameForMessages?: boolean;
}

/** Config d'actions à fournir au formulaire, avec save unique. */
export interface ActionConfig<T> {
    /** Fonction pour récupérer la liste des paramètres pour l'action de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => any[] | undefined;
    /** Action de chargement. */
    load?: (...args: any[]) => Promise<T>;
    /** Action de sauvegarde. Obligatoire. */
    save: (entity: T) => Promise<T | void>;
}

/** Config d'actions à fournir au formulaire, avec saves multiples. */
export interface ActionConfigMultiple<
    T,
    S extends {[key: string]: (entity: T) => Promise<T | void>; default: (entity: T) => Promise<T | void>}
> {
    /** Fonction pour récupérer la liste des paramètres pour l'action de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => any[] | undefined;
    /** Action de chargement. */
    load?: (...args: any[]) => Promise<T>;
    /** Actions de sauvegarde. L'action "default" est obligatoire. */
    save: S;
}

/** Gère les actions d'un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
export type FormActions<S extends string = "default"> = {
    /** Dispose la réaction de chargement. */
    dispose?: Lambda;
    /** Contexte du formulaire, pour forcer l'affichage des erreurs aux Fields enfants. */
    readonly formContext: {forceErrorDisplay: boolean};
    /** Formulaire en chargement. */
    isLoading: boolean;
    /** Récupère les props à fournir à un Form pour lui fournir les actions. */
    readonly formProps: FormProps;
    /** Récupère les props à fournir à un Panel pour relier ses boutons aux actions. */
    readonly panelProps: PanelProps;
    /** Appelle le service de chargement (appelé par la réaction de chargement). */
    load(): Promise<void>;
    /** Appelle le service de sauvegarde. */
    save(): Promise<void>;
    /** Handler de clic sur le bouton "Annuler". */
    onClickCancel(): void;
    /** Handler de clic sur le bouton "Modifier". */
    onClickEdit(): void;
} & {[P in Exclude<S, "default">]: () => Promise<void>};

/**
 * Crée les actions d'un formulaire.
 * @param formNode Le FormNode du formulaire.
 * @param actions La config d'actions pour le formulaire ({getLoadParams, load, save}).
 * @param config Configuration additionnelle.
 */
export function makeFormActions<T extends Entity, U>(
    componentClass: React.Component | null,
    formNode: FormListNode<T, U>,
    actions: ActionConfig<EntityToType<T>[]>,
    config?: FormConfig
): FormActions;
export function makeFormActions<
    T extends Entity,
    U,
    S extends {
        [key: string]: (entity: EntityToType<T>[]) => Promise<EntityToType<T>[] | void>;
        default: (entity: EntityToType<T>[]) => Promise<EntityToType<T>[] | void>;
    }
>(
    componentClass: React.Component | null,
    formNode: FormListNode<T, U>,
    actions: ActionConfigMultiple<EntityToType<T>[], S>,
    config?: FormConfig<Extract<keyof S, string>>
): FormActions<Extract<keyof S, string>>;
export function makeFormActions<T extends Entity, U>(
    componentClass: React.Component | null,
    formNode: FormNode<T, U>,
    actions: ActionConfig<EntityToType<T>>,
    config?: FormConfig
): FormActions;
export function makeFormActions<
    T extends Entity,
    U,
    S extends {
        [key: string]: (entity: EntityToType<T>) => Promise<EntityToType<T> | void>;
        default: (entity: EntityToType<T>) => Promise<EntityToType<T> | void>;
    }
>(
    componentClass: React.Component | null,
    formNode: FormNode<T, U>,
    actions: ActionConfigMultiple<EntityToType<T>, S>,
    config?: FormConfig<Extract<keyof S, string>>
): FormActions<Extract<keyof S, string>>;
export function makeFormActions<
    T extends Entity,
    U,
    S extends {[key: string]: (entity: any) => Promise<any>; default: (entity: any) => Promise<any>}
>(
    componentClass: React.Component | null,
    formNode: FormNode<T, U> | FormListNode<T, U>,
    actions: ActionConfig<any> | ActionConfigMultiple<any, S>,
    config: FormConfig = {}
) {
    // On se prépare à construire plusieurs actions de sauvegarde.
    function buildSave(name: Extract<keyof S, string>, saveService: (entity: any) => Promise<any | void>) {
        return async function save(this: FormActions<Extract<keyof S, string>>) {
            this.formContext.forceErrorDisplay = true;

            // On ne fait rien si on est déjà en chargement.
            if (this.isLoading) {
                return;
            }

            try {
                // On ne sauvegarde que si la validation est en succès.
                if (formNode.form && !formNode.form.isValid) {
                    throw {
                        $validationError: true,
                        detail: formNode.form.errors
                    };
                }

                this.isLoading = true;
                const data = await saveService(toFlatValues(formNode));
                runInAction("afterSave", () => {
                    this.isLoading = false;
                    formNode.form.isEdit = false;
                    if (data) {
                        // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                        if (isStoreNode(formNode.sourceNode)) {
                            formNode.sourceNode.replace(data);
                        } else {
                            formNode.sourceNode.replaceNodes(data);
                        }
                    }
                });

                // Pour supprimer le message, il "suffit" de faire en sorte qu'il soit vide.
                const savedMessage = i18next.t(
                    `${config.i18nPrefix || "focus"}.detail${config.useSaveNameForMessages ? `.${name}` : ""}.saved`
                );
                if (savedMessage) {
                    messageStore.addSuccessMessage(savedMessage);
                }

                // On ne force plus l'affichage des erreurs une fois la sauvegarde effectuée, puisqu'il n'y a plus.
                this.formContext.forceErrorDisplay = false;

                if (config.onFormSaved) {
                    config.onFormSaved(name as "default");
                }
            } catch (e) {
                if (config.onFormError) {
                    config.onFormError(e);
                }
                throw e;
            } finally {
                this.isLoading = false;
            }
        };
    }

    const formActions = observable(
        {
            formContext: {forceErrorDisplay: false},
            isLoading: false,

            get formProps(): FormProps {
                return {
                    formContext: this.formContext,
                    save: this.save
                };
            },

            get panelProps(): PanelProps {
                return {
                    editing: formNode.form.isEdit,
                    loading: this.isLoading,
                    onClickCancel: this.onClickCancel,
                    onClickEdit: this.onClickEdit,
                    save: this.save
                };
            },

            async load() {
                const {getLoadParams, load} = actions;

                // On n'effectue le chargement que si on a un service de chargement et des paramètres pour le service.
                if (getLoadParams && load) {
                    const params = getLoadParams();
                    if (params) {
                        this.isLoading = true;
                        const data = await load(...params);
                        runInAction("afterLoad", () => {
                            if (isStoreNode(formNode.sourceNode)) {
                                formNode.sourceNode.replace(data);
                            } else {
                                formNode.sourceNode.replaceNodes(data);
                            }

                            this.isLoading = false;
                        });

                        if (config.onFormLoaded) {
                            config.onFormLoaded();
                        }
                    }
                }
            },

            onClickCancel() {
                formNode.form.isEdit = false;
                formNode.reset();
                if (config.onClickCancel) {
                    config.onClickCancel();
                }
            },

            onClickEdit() {
                formNode.form.isEdit = true;
                if (config.onClickEdit) {
                    config.onClickEdit();
                }
            }
        } as FormActions,
        {
            formProps: computed.struct,
            panelProps: computed.struct,
            load: action.bound,
            onClickCancel: action.bound,
            onClickEdit: action.bound
        }
    );

    // On ajoute le ou les actions de sauvegarde.
    if (isFunction(actions.save)) {
        extendObservable(
            formActions,
            {save: buildSave("default" as Extract<keyof S, string>, actions.save)},
            {save: action.bound}
        );
    } else {
        for (const save in actions.save) {
            const name = save === "default" ? "save" : save;
            extendObservable(formActions, {[name]: buildSave(save, actions.save[save])}, {[name]: action.bound});
        }
    }

    // On met en place la réaction de chargement.
    if (actions.getLoadParams) {
        formActions.dispose = reaction(actions.getLoadParams, formActions.load, {equals: comparer.structural});

        // Et on la lie au composant, si renseigné.
        if (componentClass) {
            disposeOnUnmount(componentClass, formActions.dispose);
        }
    }

    // On appelle le chargement.
    formActions.load();

    return formActions;
}
