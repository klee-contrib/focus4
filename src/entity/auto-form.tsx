import {autobind} from "core-decorators";
import {isEmpty} from "lodash";
import {observable, action, runInAction} from "mobx";
import * as React from "react";

import {applicationStore} from "../application";
import * as defaults from "../defaults";
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

/** Props propre à AutoForm. */
export interface AutoFormProps {

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

    /** Pour ajouter une classe particulière sur le formulaire. */
    style?: { className?: string };
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

    /**
     * Handler du bouton d'annulation.
     * Repasse le formulaire en consulation et récupère l'état du store.
     */
    @action
    onClickCancel() {
        this.errors = {};
        this.isEdit = false;
        this.entity.reset();
        applicationStore.changeMode("consult", "edit");
    }

    /**
     * Handler du bouton de suppression.
     * Appelle l'action de suppression.
     */
    @action
    async onClickDelete() {
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

    /**
     * Handler du bouton d'édition.
     * Passe le formulaire en édition et vide les erreurs.
     */
    @action
    onClickEdit() {
        this.isEdit = !this.isEdit;
        applicationStore.changeMode("edit", "consult");
        this.errors = {};
    }

    /**
     * Handler du bouton de sauvegarde.
     * Valide l'entité et appelle l'action de sauvegarde.
     */
    @action
    async onClickSave() {
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

    /** Retourne les actions du formulaire. */
    renderActions() {
        return this.isEdit ? this.renderEditActions() : this.renderConsultActions();
    }

    /** Retoune les actions en consulation du formualaire. */
    renderConsultActions() {
        let {hasEdit = true, hasDelete = false} = this.props;
        return <span>{hasEdit ? this.buttonEdit : null} {hasDelete ? this.buttonDelete : null}</span>;
    }

    /** Retourne les action en édition du formulaire. */
    renderEditActions() {
        return <span>{this.buttonSave} {this.buttonCancel}</span>;
    }

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

    private get buttonCancel() {
        const {Button} = defaults;
        if (!Button) { throw new Error("Le composant Button n'a pas été défini. Utiliser 'autofocus/defaults' pour enregistrer les défauts."); }
        return (
            <Button
                handleOnClick={this.onClickCancel}
                icon="undo"
                label="button.cancel"
                shape={null}
                type="button"
            />
        );
    }

    private get buttonDelete() {
        const {Button} = defaults;
        if (!Button) { throw new Error("Le composant Button n'a pas été défini. Utiliser 'autofocus/defaults' pour enregistrer les défauts."); }
        return (
            <Button
                handleOnClick={this.onClickDelete}
                icon="delete"
                label="button.delete"
                shape={null}
                type="button"
            />
        );
    }

    private get buttonEdit() {
        const {Button} = defaults;
        if (!Button) { throw new Error("Le composant Button n'a pas été défini. Utiliser 'autofocus/defaults' pour enregistrer les défauts."); }
        return (
            <Button
                handleOnClick={this.onClickEdit}
                icon="edit"
                label="button.edit"
                shape={null}
                type="button"
            />
        );
    }

    private get buttonSave() {
        const {Button} = defaults;
        if (!Button) { throw new Error("Le composant Button n'a pas été défini. Utiliser 'autofocus/defaults' pour enregistrer les défauts."); }
        return (
            <Button
                handleOnClick={this.onClickSave}
                icon="save"
                label="button.save"
                shape={null}
                type="button"
            />
        );
    }

    abstract renderContent(): React.ReactElement<any> | null;
    render() {
        const {hasForm = true, style} = this.props;
        if (hasForm) {
            return (
                <form
                    className={`form-horizontal ${style && style.className || ""}`}
                    data-loading={this.isLoading}
                    data-mode={this.isEdit ? "edit" : "consult"}
                    noValidate={true}
                    onSubmit={e => { e.preventDefault(); this.onClickSave(); }}
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
