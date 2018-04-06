import i18next from "i18next";
import {action, comparer, computed, Lambda, observable, reaction, runInAction} from "mobx";

import {PanelProps} from "../../components";
import {messageStore} from "../../message";

import {toFlatValues} from "../store";
import {BaseStoreNode, NodeToType} from "../types";
import {FormProps} from "./form";
import {isFormNode} from "./node";

/** Configuration additionnelle du formulaire.. */
export interface FormConfig {
    /** Vide le store de base à l'initialisation. */
    clearBeforeInit?: boolean;
    /** Préfixe i18n. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Appelé après le chargement. */
    onFormLoaded?: () => void;
    /** Appelé après la sauvegarde. */
    onFormSaved?: () => void;
    /** Appelé après le changement de mode. */
    onToggleEdit?: (edit: boolean) => void;
}

/** Config de services à fournir au formulaire. */
export interface ServiceConfig<T> {
    /** Fonction pour récupérer la liste des paramètres pour le service de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => any[] | undefined;
    /** Service de chargement. */
    load?: (...args: any[]) => Promise<T>;
    /** Service de sauvegarde. Obligatoire. */
    save: (entity: T) => Promise<T>;
}

/** Gère les actions d'un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
export class FormActions<T extends BaseStoreNode> {

    /** Contexte du formulaire, pour forcer l'affichage des erreurs aux Fields enfants. */
    readonly formContext: {forceErrorDisplay: boolean} = observable({forceErrorDisplay: false});
    /** Formulaire en chargement. */
    @observable isLoading = false;
    /** Services. */
    readonly services: ServiceConfig<NodeToType<T>>;

    /** Config. */
    private readonly config: FormConfig;
    /** Etat courant du formulaire, à définir à partir de `makeFormNode`. Sera réinitialisé à chaque modification du `sourceNode`. */
    private readonly entity: T;
    /** Disposer de la réaction de chargement. */
    private readonly loadDisposer?: Lambda;
    constructor(formNode: T, services: ServiceConfig<NodeToType<T>>, config?: FormConfig) {
        if (!formNode.form) {
            throw new Error("Impossible de créer un formulaire à partir d'un noeud non passé par `makeFormNode`.");
        }

        this.entity = formNode;
        this.config = config || {};
        this.services = services;

        // On met en place la réaction de chargement.
        if (services.getLoadParams) {
            this.loadDisposer = reaction(services.getLoadParams, this.load, {equals: comparer.structural});
        }
    }

    /** Récupère les props à fournir à un Form pour lui fournir les actions. */
    @computed.struct
    get formProps(): FormProps {
        return {
            clean: this.clean,
            formContext: this.formContext,
            load: this.load,
            save: this.save
        };
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons aux actions. */
    @computed.struct
    get panelProps(): PanelProps {
        return {
            editing: this.entity.form!.isEdit,
            loading: this.isLoading,
            save: this.save,
            toggleEdit: this.toggleEdit,
        };
    }

    /** Supprime les réactions du formulaire et de son FormNode. */
    @action.bound
    clean() {
        if (this.loadDisposer) {
            this.loadDisposer();
        }
        if (isFormNode(this.entity)) {
            this.entity.unsubscribe();
        }
    }

    /** Appelle le service de chargement (appelé par la réaction de chargement). */
    @action.bound
    async load() {
        const {getLoadParams, load} = this.services;

        if (this.config.clearBeforeInit && isFormNode(this.entity)) {
            this.entity.sourceNode.clear();
        }

        // On n'effectue le chargement que si on a un service de chargement et des paramètres pour le service.
        // Aussi, un formulaire sur un sous-node ne peut pas gérer de chargement.
        if (getLoadParams && load && isFormNode(this.entity)) {
            const params = getLoadParams();
            if (params) {
                this.isLoading = true;
                this.entity.sourceNode.clear();
                const data = await load(...params);
                runInAction("afterLoad", () => {
                    (this.entity as any).sourceNode.set(data);
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
        if (!this.entity.form || this.entity.form.isValid) {
            this.isLoading = true;
            try {
                const data = await this.services.save(toFlatValues(this.entity));
                runInAction("afterSave", () => {
                    this.isLoading = false;
                    this.entity.form!.isEdit = false;
                    if (isFormNode(this.entity)) {
                         // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                         // On ne peut pas faire ça dans un sous-noeud, mais bon à priori on s'en fiche un peu.
                        this.entity.sourceNode.set(data);
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
    }

    /** Change le mode du formulaire. */
    @action.bound
    toggleEdit(isEdit: boolean) {
        this.entity.form!.isEdit = isEdit;
        if (!isEdit && isFormNode(this.entity)) {
            this.entity.reset();
        }
        if (this.config.onToggleEdit) {
            this.config.onToggleEdit(isEdit);
        }
    }
}

/**
 * Crée un formulaire.
 * @param formNode Le FormNode du formulaire.
 * @param services La config de services pour le formulaire ({getLoadParams, load, save}).
 * @param config Configuration additionnelle.
 */
export function makeFormActions<T extends BaseStoreNode>(formNode: T, services: ServiceConfig<NodeToType<T>>, config?: FormConfig) {
    return new FormActions<T>(formNode, services, config);
}
