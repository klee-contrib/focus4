import {autobind} from "core-decorators";
import {action, Lambda, observable, reaction, runInAction} from "mobx";
import * as React from "react";

import {PanelProps} from "../components";
import {messageStore} from "../message";

import {Form} from "./form";
import {toFlatValues} from "./store";
import {FormNode, StoreNode} from "./types";

/** Options additionnelles de l'AutoForm. */
export interface AutoFormOptions {
    /** Pour ajouter une classe particulière sur le formulaire. */
    className?: string;
    /** Par défaut: true */
    hasForm?: boolean;
    /** Préfixe i18n pour les messages du formulaire (par défaut: "focus") */
    i18nPrefix?: string;
}

/** Config de services à fournir à AutoForm. */
export interface ServiceConfig<T, LP> {

    /** Fonction pour récupérer la liste des paramètres pour le service de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => LP[] | undefined;

    /** Service de chargement. */
    load?: (...args: LP[]) => Promise<T>;

    /** Service de sauvegarde. Obligatoire. */
    save: (entity: T) => Promise<T>;
}

/** Classe de base pour un créer un composant avec un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
@autobind
export abstract class AutoForm<P = {}> extends React.Component<P, void> {

    /** Etat courant du formulaire, à définir à partir de `makeFormNode`. Sera réinitialisé à chaque modification du `sourceNode`. */
    abstract entity: StoreNode & FormNode;

    /** Formulaire en chargement. */
    @observable isLoading = false;

    /** Classe CSS additionnelle (passée en options). */
    private className!: string;
    /** Contexte du formulaire, pour forcer l'affichage des erreurs aux Fields enfants. */
    private readonly formContext = observable({forceErrorDisplay: false});
    /** Insère ou non un formulaire HTML. */
    private hasForm!: boolean;
    /** Préfixe i18n pour les messages du formulaire */
    private i18nPrefix!: string;
    /** Disposer de la réaction de chargement. */
    private loadDisposer?: Lambda;
    /** Services. */
    private services!: ServiceConfig<any, any>;

    /**
     * A implémenter pour initialiser le formulaire. Il faut appeler `this.formInit` à l'intérieur.
     *
     * Sera appelé pendant `componentWillMount` avant le chargement.
     */
    abstract init(): void;

    /**
     * Initialise le formulaire.
     * @param storeData L'EntityStoreData de base du formulaire.
     * @param services La config de services pour le formulaire ({delete?, getLoadParams, load, save}).
     * @param options Options additionnelles.
     */
    formInit(services: ServiceConfig<any, any>, {className, hasForm, i18nPrefix}: AutoFormOptions = {}) {
        this.services = services;
        this.hasForm = hasForm !== undefined ? hasForm : true;
        this.className = className || "";
        this.i18nPrefix = i18nPrefix || "focus";

        // On met en place la réaction de chargement.
        if (services.getLoadParams) {
            this.loadDisposer = reaction(services.getLoadParams, this.load, {compareStructural: true});
        }
    }

    componentWillMount() {
        this.init();
    }

    clean() {
        this.entity.unsubscribe();
        if (this.loadDisposer) {
            this.loadDisposer();
        }
    }

    /** Change le mode du formulaire. */
    @action
    toggleEdit(isEdit: boolean) {
        this.entity.form.isEdit = isEdit;
        if (!isEdit) {
            this.entity.reset();
        }
    }

    /** Appelle le service de chargement (appelé par la réaction de chargement). */
    @action
    async load() {
        const {getLoadParams, load} = this.services;

        // On n'effectue le chargement que si on a un service de chargement et des paramètres pour le service.
        if (getLoadParams && load) {
            const params = getLoadParams();
            if (params) {
                this.isLoading = true;
                this.entity.sourceNode.clear();
                const data = await load(...params);
                runInAction("afterLoad", () => {
                    this.entity.sourceNode.set(data);
                    this.isLoading = false;
                });
                this.onFormLoaded();
            }
        }
    }

    /** Appelle le service de sauvegarde. */
    @action
    async save() {
        // On force l'affichage des erreurs.
        this.formContext.forceErrorDisplay =  true;

        // On ne sauvegarde que si la validation est en succès.
        if (!this.entity.form || this.entity.form.isValid) {
            this.isLoading = true;
            try {
                const data = await this.services.save(toFlatValues(this.entity));
                runInAction("afterSave", () => {
                    this.isLoading = false;
                    this.entity.form.isEdit = false;
                    this.entity.sourceNode.set(data); // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                });
                this.onFormSaved();
            } catch (e) {
                this.isLoading = false;
            }
        }
    }

    /** Est appelé après le chargement. */
    onFormLoaded() {
        // A éventuellement surcharger.
    }

    /** Est appelé après la sauvegarde. */
    onFormSaved() {
        messageStore.addSuccessMessage(`${this.i18nPrefix}.detail.saved`);
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons au formulaire. */
    getPanelProps(): PanelProps {
        return {
            editing: this.entity.form.isEdit,
            loading: this.isLoading,
            save: this.hasForm ? undefined : this.save,
            toggleEdit: this.toggleEdit,
        };
    }

    /** Fonction de rendu du formulaire à préciser. */
    abstract renderContent(): React.ReactElement<any> | null;
    render() {
        return (
            <Form
                clean={this.clean}
                formContext={this.formContext}
                hasForm={this.hasForm}
                load={this.load}
                save={this.save}
                theme={{form: this.className}}
            >
                {this.renderContent()}
            </Form>
        );
    }
}

export default AutoForm;
