import i18next from "i18next";
import {action, comparer, computed, extendObservable, Lambda, observable, reaction, runInAction} from "mobx";
import {disposeOnUnmount} from "mobx-react";

import {PanelProps} from "../../components";
import {messageStore} from "../../message";

import {toFlatValues} from "../store";
import {Entity, EntityToType, FormListNode, FormNode, isStoreNode} from "../types";
import {FormProps} from "./form";

/** Configuration additionnelle du formulaire.. */
export interface FormConfig {
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Appelé au clic sur le bouton "Annuler". */
    onClickCancel?: () => void;
    /** Appelé au clic sur le bouton "Modifier". */
    onClickEdit?: () => void;
    /** Appelé après le chargement. */
    onFormLoaded?: () => void;
    /** Appelé après la sauvegarde. */
    onFormSaved?: () => void;
}

/** Config d'actions à fournir au formulaire. */
export interface ActionConfig<T, S extends string = never> {
    /** Fonction pour récupérer la liste des paramètres pour l'action de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => any[] | undefined;
    /** Action de chargement. */
    load?: (...args: any[]) => Promise<T>;
    /** Action de sauvegarde. Obligatoire. */
    save: (entity: T) => Promise<T | void>;
    /** Services de sauvegarde supplémentaires. */
    saves?: {[P in S]: (entity: T) => Promise<T | void>};
}

/** Gère les actions d'un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
export type FormActions<S extends string = never> = {
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
    load(): void;
    /** Appelle le service de sauvegarde. */
    save(): void;
    /** Handler de clic sur le bouton "Annuler". */
    onClickCancel(): void;
    /** Handler de clic sur le bouton "Modifier". */
    onClickEdit(): void;
} & {[P in S]: () => void};

/**
 * Crée les actions d'un formulaire.
 * @param formNode Le FormNode du formulaire.
 * @param actions La config d'actions pour le formulaire ({getLoadParams, load, save}).
 * @param config Configuration additionnelle.
 */
export function makeFormActions<T extends Entity, U, S extends string = never>(
    componentClass: React.Component | null,
    formNode: FormListNode<T, U>,
    actions: ActionConfig<EntityToType<T>[], S>,
    config?: FormConfig
): FormActions<S>;
export function makeFormActions<T extends Entity, U, S extends string = never>(
    componentClass: React.Component | null,
    formNode: FormNode<T, U>,
    actions: ActionConfig<EntityToType<T>, S>,
    config?: FormConfig
): FormActions<S>;
export function makeFormActions<T extends Entity, U, S extends string>(
    componentClass: React.Component | null,
    formNode: FormNode<T, U> | FormListNode<T, U>,
    actions: ActionConfig<any, S>,
    config: FormConfig = {}
) {
    // On se prépare à construire plusieurs actions de sauvegarde.
    function buildSave(saveService: (entity: any) => Promise<any | void>) {
        return async function save(this: FormActions<S>) {
            this.formContext.forceErrorDisplay = true;

            // On ne fait rien si on est déjà en chargement.
            if (this.isLoading) {
                return;
            }

            // On ne sauvegarde que si la validation est en succès.
            if (formNode.form && !formNode.form.isValid) {
                return Promise.reject({error: "Le formulaire est invalide", detail: formNode.form.errors});
            }

            try {
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
                const savedMessage = i18next.t(`${config.i18nPrefix || "focus"}.detail.saved`);
                if (savedMessage) {
                    messageStore.addSuccessMessage(savedMessage);
                }
                if (config.onFormSaved) {
                    config.onFormSaved();
                }
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

            save: buildSave(actions.save),

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
            save: action.bound,
            onClickCancel: action.bound,
            onClickEdit: action.bound
        }
    );

    // On ajoute les services de sauvegardes additionnels.
    if (actions.saves) {
        for (const save in actions.saves) {
            extendObservable(formActions, {[save]: buildSave(actions.saves[save])}, {[save]: action.bound});
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
