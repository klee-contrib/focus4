import i18next from "i18next";
import {action, comparer, computed, Lambda, observable, reaction, runInAction} from "mobx";

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
export interface ActionConfig<T = any> {
    /** Fonction pour récupérer la liste des paramètres pour l'action de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => any[] | undefined;
    /** Action de chargement. */
    load?: (...args: any[]) => Promise<T>;
    /** Action de sauvegarde. Obligatoire. */
    save: (entity: T) => Promise<T | void>;
}

/** Gère les actions d'un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
export class FormActions {
    /** Contexte du formulaire, pour forcer l'affichage des erreurs aux Fields enfants. */
    readonly formContext: {forceErrorDisplay: boolean} = observable({forceErrorDisplay: false});
    /** Formulaire en chargement. */
    @observable isLoading = false;

    /** Services. */
    private readonly actions: ActionConfig;
    /** Config. */
    private readonly config: FormConfig;
    /** Etat courant du formulaire, à définir à partir de `makeFormNode`. Sera réinitialisé à chaque modification du `sourceNode`. */
    private readonly entity: FormNode | FormListNode;
    /** Disposer de la réaction de chargement. */
    private readonly loadDisposer?: Lambda;

    constructor(formNode: FormNode | FormListNode, actions: ActionConfig, config?: FormConfig) {
        this.entity = formNode;
        this.config = config || {};
        this.actions = actions;

        // On met en place la réaction de chargement.
        if (actions.getLoadParams) {
            this.loadDisposer = reaction(actions.getLoadParams, this.load, {equals: comparer.structural});
        }
    }

    /** Récupère les props à fournir à un Form pour lui fournir les actions. */
    @computed.struct
    get formProps(): FormProps {
        return {
            dispose: this.dispose,
            formContext: this.formContext,
            load: this.load,
            save: this.save
        };
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons aux actions. */
    @computed.struct
    get panelProps(): PanelProps {
        return {
            editing: this.entity.form.isEdit,
            loading: this.isLoading,
            onClickCancel: this.onClickCancel,
            onClickEdit: this.onClickEdit,
            save: this.save
        };
    }

    /** Supprime les réactions du formulaire et de son FormNode. */
    @action.bound
    dispose() {
        if (this.loadDisposer) {
            this.loadDisposer();
        }
        this.entity.dispose();
    }

    /** Appelle le service de chargement (appelé par la réaction de chargement). */
    @action.bound
    async load() {
        const {getLoadParams, load} = this.actions;

        // On n'effectue le chargement que si on a un service de chargement et des paramètres pour le service.
        if (getLoadParams && load) {
            const params = getLoadParams();
            if (params) {
                this.isLoading = true;
                const data = await load(...params);
                runInAction("afterLoad", () => {
                    if (isStoreNode(this.entity.sourceNode)) {
                        this.entity.sourceNode.replace(data);
                    } else {
                        this.entity.sourceNode.replaceNodes(data);
                    }

                    this.isLoading = false;
                });

                if (this.config.onFormLoaded) {
                    this.config.onFormLoaded();
                }
            }
        }
    }

    /** Appelle le service de sauvegarde. */
    @action.bound
    async save() {
        this.formContext.forceErrorDisplay = true;

        // On ne sauvegarde que si la validation est en succès.
        if (this.entity.form && !this.entity.form.isValid) {
            return Promise.reject({error: "Le formulaire est invalide", detail: this.entity.form.errors});
        }

        try {
            this.isLoading = true;
            const data = await this.actions.save(toFlatValues(this.entity));
            runInAction("afterSave", () => {
                this.isLoading = false;
                this.entity.form.isEdit = false;
                if (data) {
                    // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                    if (isStoreNode(this.entity.sourceNode)) {
                        this.entity.sourceNode.replace(data);
                    } else {
                        this.entity.sourceNode.replaceNodes(data);
                    }
                }
            });

            // Pour supprimer le message, il "suffit" de faire en sorte qu'il soit vide.
            const savedMessage = i18next.t(`${this.config.i18nPrefix || "focus"}.detail.saved`);
            if (savedMessage) {
                messageStore.addSuccessMessage(savedMessage);
            }
            if (this.config.onFormSaved) {
                this.config.onFormSaved();
            }
        } finally {
            this.isLoading = false;
        }
    }

    /** Handler de clic sur le bouton "Annuler". */
    @action.bound
    onClickCancel() {
        this.entity.form.isEdit = false;
        this.entity.reset();
        if (this.config.onClickCancel) {
            this.config.onClickCancel();
        }
    }

    /** Handler de clic sur le bouton "Modifier". */
    @action.bound
    onClickEdit() {
        this.entity.form.isEdit = true;
        if (this.config.onClickEdit) {
            this.config.onClickEdit();
        }
    }
}

/**
 * Crée un formulaire.
 * @param formNode Le FormNode du formulaire.
 * @param actions La config d'actions pour le formulaire ({getLoadParams, load, save}).
 * @param config Configuration additionnelle.
 */
export function makeFormActions<T extends Entity, U>(
    formNode: FormListNode<T, U>,
    actions: ActionConfig<EntityToType<T>[]>,
    config?: FormConfig
): FormActions;
export function makeFormActions<T extends Entity, U>(
    formNode: FormNode<T, U>,
    actions: ActionConfig<EntityToType<T>>,
    config?: FormConfig
): FormActions;
export function makeFormActions<T extends Entity, U>(
    formNode: FormNode<T, U> | FormListNode<T, U>,
    actions: ActionConfig,
    config?: FormConfig
) {
    return new FormActions(formNode as any, actions, config);
}
