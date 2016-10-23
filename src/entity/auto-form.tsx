import {autobind} from "core-decorators";
import {isEmpty} from "lodash";
import {observable, action, runInAction} from "mobx";
import * as React from "react";

import {PanelButtonsProps} from "focus-components/panel";

import {applicationStore} from "../application";
import {messageStore} from "../message";
import {FieldErrors} from "../network";

import {Field} from "./field";
import {ClearSet, toFlatValues} from "./store";
import {EntityField} from "./types";
import {createViewModel, ViewModel} from "./view-model";

import {
    AutocompleteSelectOptions,
    AutocompleteTextOptions,
    BaseOptions,
    FieldOptions,
    SelectOptions,
    TextOptions,
    autocompleteSelectFor,
    autocompleteTextFor,
    displayFor,
    fieldFor,
    fieldForWith,
    selectFor,
    stringFor,
    textFor
} from "./field-helpers";

import {form} from "./style/auto-form.css";

/** Props propre à AutoForm. */
export interface AutoFormProps {

    /** Pour ajouter une classe particulière sur le formulaire. */
    className?: string;

    /** Défaut: true */
    hasEdit?: boolean;

    /** Défaut: false */
    hasDelete?: boolean;

    /** Défaut: true */
    hasForm?: boolean;

    /** Défaut: true */
    hasLoad?: boolean;

    /** L'id ne sera utilisé que par le service de chargement. */
    id?: number | string;

    /** Défaut: false */
    isEdit?: boolean;
}

/** Config de services à fournir à AutoForm. */
export interface ServiceConfig {
    [x: string]: any;
    delete?: (entity: {}) => Promise<void | number | boolean>;
    load: (id: number | string) => Promise<{}>;
    save: (entity: {}) => Promise<{}>;
}

/** Classe de base pour un composant Focus avec un formulaire. */
@autobind
export abstract class AutoForm<P, E extends ClearSet<{}>> extends React.Component<P & AutoFormProps, void> {
    private isCustomEntity: boolean;
    private services: ServiceConfig;
    private storeData: E;

    entity: E & ViewModel;

    @observable errors: FieldErrors = {};
    @observable isEdit = this.props.isEdit || false;
    @observable isLoading = false;

    /**
     * Initialise le formulaire.
     * @param props Les props du composant.
     * @param storeData L'EntityStoreData de base du formulaire.
     * @param services La config de services pour le formulaire ({delete?, load, save}).
     * @param entity ViewModel externe de `storeData`, s'il y a besoin d'externaliser le state interne du formulaire.
     */
    constructor(props: P, storeData: E, services: ServiceConfig, entity?: E & ViewModel) {
        super(props);
        this.storeData = storeData;
        this.services = services;
        this.entity = entity || createViewModel(storeData);
        this.isCustomEntity = entity !== undefined;
    }

    @action
    async componentWillMount() {
        this.entity.subscribe();
        let {hasLoad = true, id} = this.props;
        if (hasLoad && id) {
            this.isLoading = true;
            const data = await this.services.load(id);
            runInAction(() => {
                this.storeData.set(data);
                this.isLoading = false;
            });
        }
    }

    componentWillUnmount() {
        if (!this.isCustomEntity) {
            this.entity.unsubscribe();
        }
    }

    /** Change le mode du formulaire. */
    @action
    toggleEdit(isEdit: boolean) {
        this.isEdit = isEdit;
        this.errors = {};
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
            await this.services.delete(toFlatValues(this.entity as any));
            messageStore.addSuccessMessage("detail.deleted");
            runInAction(() => {
                this.isLoading = false;
                this.storeData = {} as E;
            });
        }
    }

    /** Appelle le service de sauvegarde. */
    @action
    async save() {
        this.errors = {};
        if (this.validate()) {
            this.isLoading = true;
            try {
                const data = await this.services.save(toFlatValues(this.entity as any));
                messageStore.addSuccessMessage("detail.saved");
                runInAction(() => {
                    this.isLoading = false;
                    this.isEdit = false;
                    this.storeData.set(data);
                });
            } catch (e) {
                messageStore.addErrorMessage("detail.error");
                runInAction(() => this.errors = e.fields);
            }
        }
    }

    /** Valide les différents champs du formulaire. */
    @action
    validate() {
        for (const ref in this.refs) {
            const field = this.refs[ref];
            if (field instanceof Field) {
                let validationRes = field.validate();
                if (validationRes !== true) {
                    this.errors[ref] = validationRes;
                }
            }
        }
        if (isEmpty(this.errors)) {
            return true;
        }
        return false;
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons au formulaire. */
    getPanelButtonProps(): PanelButtonsProps {
        return {
            editing: this.isEdit,
            getUserInput: () => ({}), // Pas besoin de passer l'input il est déjà dans le state du formulaire.
            toggleEdit: this.toggleEdit,
            save: this.save
        };
    }

    abstract renderContent(): React.ReactElement<any> | null;
    render() {
        const {hasForm = true, className = ""} = this.props;
        if (hasForm) {
            return (
                <form
                    className={`${className} ${form}`}
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

    private setFieldOptions<T>(field: EntityField<T>, options: {[key: string]: any}) {
        options["isEdit"] = this.isEdit;
        options["error"] = this.errors[field.$entity.translationKey];
        options["onChange"] = options["onChange"] || action((value: any) => (this.entity as any)[field.$entity.name].value = value);
        return options as any;
    }
}
