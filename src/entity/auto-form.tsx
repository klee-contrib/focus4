import {autobind} from "core-decorators";
import {some, values} from "lodash";
import {action, Lambda, observable, reaction, runInAction} from "mobx";
import * as React from "react";

import {PanelButtonsProps} from "focus-components/panel";

import {applicationStore} from "../application";
import {messageStore} from "../message";

import {Field} from "./field";
import {StoreNode, toFlatValues} from "./store";
import {EntityField} from "./types";
import {createViewModel, ViewModel} from "./view-model";

import {
    autocompleteSelectFor,
    AutocompleteSelectOptions,
    autocompleteTextFor,
    AutocompleteTextOptions,
    BaseOptions,
    displayFor,
    fieldFor,
    fieldForWith,
    FieldOptions,
    selectFor,
    SelectOptions,
    stringFor,
    textFor,
    TextOptions
} from "./field-helpers";

import {form, loading} from "./style/auto-form.css";

/** Options additionnelles de l'AutoForm. */
export interface AutoFormOptions<E> {

    /** Pour ajouter une classe particulière sur le formulaire. */
    className?: string;

    /** ViewModel externe de `storeData`, s'il y a besoin d'externaliser le state interne du formulaire. */
    entity?: E & ViewModel;

    /** Par défaut: true */
    hasForm?: boolean;

    /** Par défaut: false */
    initiallyEditing?: boolean;
}

/** Config de services à fournir à AutoForm. */
export interface ServiceConfig {

    /** Service de suppression. */
    delete?: (entity: {}) => Promise<void | number | boolean>;

    /** Fonction pour récupérer la liste des paramètres pour le service de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => any[];

    /** Service de chargement. */
    load?: (...args: any[]) => Promise<{}>;

    /** Service de sauvegarde. Obligatoire. */
    save: (entity: {}) => Promise<{}>;
}

/** Classe de base pour un créer un composant avec un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
@autobind
export abstract class AutoForm<P, E extends StoreNode<{}>> extends React.Component<P, void> {

    // On ne peut pas injecter le contexte dans le form (héritage...) donc on va le chercher directement pour le style CSS.
    static contextTypes = {classNames: React.PropTypes.object};
    context: {classNames: {[key: string]: {[key: string]: any}}};

    /** Etat courant du formulaire, copié depuis `storeData`. Sera réinitialisé à chaque modification de ce dernier. */
    entity: E & ViewModel;

    /** Services. */
    services: ServiceConfig;

    /** Noeud de store à partir du quel le formulaire a été créé. */
    storeData: E;

    /** Erreurs sur les champs issues du serveur. */
    @observable errors: Record<string, string> = {};

    /** Reférences vers les champs placés par `this.fieldFor` (pour la validation). */
    @observable fields: Record<string, Field | null> = {};

    /** Formulaire en édition. */
    @observable isEdit: boolean;

    /** Formulaire en chargement. */
    @observable isLoading = false;

    /** Classe CSS additionnelle (passée en options). */
    private className: string;

    /** Insère ou non un formulaire HTML. */
    private hasForm: boolean;

    /** Utilise ou non un ViewModel personnalisé, passé en options. */
    private isCustomEntity: boolean;

    /** Disposer de la réaction de chargement. */
    private loadDisposer?: Lambda;

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
    formInit(storeData: E, services: ServiceConfig, {entity, className, hasForm, initiallyEditing}: AutoFormOptions<E> = {}) {
        this.storeData = storeData;
        this.services = services;
        this.entity = entity || createViewModel(storeData);
        this.isCustomEntity = entity !== undefined;
        this.isEdit = initiallyEditing || false;
        this.hasForm = hasForm !== undefined ? hasForm : true;
        this.className = className || "";

        // On met en place la réaction de chargement.
        if (services.getLoadParams) {
            this.loadDisposer = reaction(services.getLoadParams, this.load, {compareStructural: true});
        }
    }

    componentWillMount() {
        this.init();
        this.entity.subscribe(); // On force l'abonnement à `this.storeData` au cas-où.
        this.load();
    }

    componentWillUnmount() {
        if (!this.isCustomEntity) {
            this.entity.unsubscribe();
        }
        if (this.loadDisposer) {
            this.loadDisposer();
        }
    }

    /** Change le mode du formulaire. */
    @action
    toggleEdit(isEdit: boolean) {
        this.isEdit = isEdit;
        if (isEdit) {
            applicationStore.changeMode("edit", "consult");
        } else {
            this.entity.reset();
            applicationStore.changeMode("consult", "edit");
        }
    }

    /** Appelle le service de suppression. */
    @action
    async delete() {
        if (this.services.delete) {
            this.isLoading = true;
            await this.services.delete(toFlatValues(this.entity));
            messageStore.addSuccessMessage("detail.deleted");
            runInAction(() => {
                this.isLoading = false;
                this.storeData.clear();
                this.onFormDeleted();
            });
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
                this.storeData.clear();
                const data = await load(...params);
                runInAction(() => {
                    this.storeData.set(data);
                    this.isLoading = false;
                    this.onFormLoaded();
                });
            }
        }
    }

    /** Appelle le service de sauvegarde. */
    @action
    async save() {
        // On ne sauvegarde que si la validation est en succès.
        if (this.validate()) {
            this.isLoading = true;
            try {
                const data = await this.services.save(toFlatValues(this.entity));
                messageStore.addSuccessMessage("detail.saved");
                runInAction(() => {
                    this.isLoading = false;
                    this.isEdit = false;
                    this.storeData.set(data); // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                    this.onFormSaved();
                });
            } catch (e) {
                runInAction(() => {
                    this.isLoading = false;
                    if (e.$parsedErrors && e.$parsedErrors.fields) {
                        this.errors = e.$parsedErrors.fields || {};
                    }
                });
            }
        }
    }

    /** Est appelé après la suppression. */
    onFormDeleted() {
        // A éventuellement surcharger.
    }

    /** Est appelé après le chargement. */
    onFormLoaded() {
        // A éventuellement surcharger.
    }

    /** Est appelé après la sauvegarde. */
    onFormSaved() {
        // A éventuellement surcharger.
    }

    /**
     * Valide les différents champs du formulaire.
     *
     * Surcharger la méthode pour ajouter une validation personnalisée.
     */
    @action
    validate() {
        // On force en premier lieu l'affichage des erreurs sur tous les champs.
        for (const field in this.fields) {
            this.fields[field]!.showError = true;
        }

        // La validation est en succès si chaque champ n'est pas en erreur.
        return !some(values(this.fields), field => field && field.error);
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons au formulaire. */
    getPanelButtonProps(): PanelButtonsProps {
        return {
            editing: this.isEdit,
            getUserInput: () => ({}), // Pas besoin de passer l'input car il est déjà dans le state du formulaire.
            save: this.save,
            toggleEdit: this.toggleEdit,
        };
    }

    /** Fonction de rendu du formulaire à préciser. */
    abstract renderContent(): React.ReactElement<any> | null;
    render() {
        const contextClassName = this.context && this.context.classNames && this.context.classNames["form"] || "";
        if (this.hasForm) {
            return (
                <form
                    className={`${form} ${contextClassName} ${this.className} ${this.isLoading ? loading : ""}`}
                    noValidate={true}
                    onSubmit={e => { e.preventDefault(); this.save(); }}
                >
                    <fieldset>{this.renderContent()}</fieldset>
                </form>
            );
        } else {
            return this.renderContent();
        }
    }

    /**
     * Crée un champ de type AutocompleteSelect.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    autocompleteSelectFor<T>(field: EntityField<T>, options: AutocompleteSelectOptions) {
        return autocompleteSelectFor(field, this.setFieldOptions(field, options));
    }

    /**
     * Crée un champ de type AutocompleteText.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    autocompleteTextFor<T>(field: EntityField<T>, options: AutocompleteTextOptions) {
        return autocompleteTextFor(field, this.setFieldOptions(field, options));
    }

    /**
     * Crée un champ standard en lecture seule.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    displayFor<T>(field: EntityField<T>, options?: BaseOptions & {[key: string]: any}) { return displayFor(field, options); }

    /**
     * Crée un champ standard.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    fieldFor<T>(field: EntityField<T>, options: BaseOptions & {[key: string]: any} = {}) {
        return fieldFor(field, this.setFieldOptions(field, options));
    }

    /**
     * Crée un champ avec des composants personnalisés.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    fieldForWith<T, DisplayProps, FieldProps, InputProps>(field: EntityField<T>, options: FieldOptions<DisplayProps, FieldProps, InputProps> & DisplayProps & FieldProps & InputProps) {
        return fieldForWith(field, this.setFieldOptions(field, options));
    }

    /**
     * Crée un champ avec résolution de référence.
     * @param field La définition de champ.
     * @param listName Le nom de la liste de référence.
     * @param options Les options du champ.
     */
    selectFor<T>(field: EntityField<T>, values: {code?: T, id?: T}[], options: SelectOptions<T> = {}) {
        return selectFor(field, values, this.setFieldOptions(field, options));
    }

    /**
     * Récupère le texte correspondant à un champ.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    stringFor<T>(field: EntityField<T>, options: TextOptions = {}) { return stringFor(field, options); }

    /**
     * Affiche un champ sous format texte.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    textFor<T>(field: EntityField<T>, options: TextOptions = {}) { return textFor(field, options); }

    /**
     * Ajoute les options aux champs pour les lier au formulaire (`ref`, `error`, `isEdit` et `onChange`).
     * @param field La définition du champ.
     * @param options Les options du champ.
     */
    private setFieldOptions<T>(field: EntityField<T>, options: {[key: string]: any}) {
        options["ref"] = (f: Field) => this.fields[field.$entity.translationKey] = f;
        options["error"] = this.errors[field.$entity.translationKey];

        if (options["isEdit"] === undefined) {
            options["isEdit"] = this.isEdit;
        }

        if ((this.entity as any)[field.$entity.name]) {
            options["onChange"] = options["onChange"] || action((value: any) =>
                (this.entity as any)[field.$entity.name].value = value
            );
        }

        return options as any;
    }
}
