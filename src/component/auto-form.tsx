/*
    TODO
    - Brancher les erreurs
    - Gérer le formState
*/

import {autobind} from "core-decorators";
import {isFunction, isEmpty} from "lodash";
import {observable, action, runInAction} from "mobx";
import * as React from "react";

import {applicationStore} from "..";
import * as defaults from "../defaults";
import {EntityField} from "../entity";

import {
    AutocompleteSelectOptions,
    AutocompleteTextOptions,
    DisplayOptions,
    FieldOptions,
    SelectOptions,
    TextOptions,
    autocompleteSelectFor,
    autocompleteTextFor,
    displayFor,
    fieldFor,
    selectFor,
    stringFor,
    textFor
} from "./field-helpers";

/** Props propre à AutoForm. */
export interface AutoFormProps {
    hasEdit?: boolean;
    hasDelete?: boolean;
    hasForm?: boolean;
    hasLoad?: boolean;
    id?: number;
    isEdit?: boolean;
    style?: { className?: string };
}

/** Config d'actions à fournir à AutoForm. */
export interface ActionConfig<E> {
    [x: string]: any;
    delete?: (entity: E) => Promise<void | number | boolean>;
    load: (id: number | string) => Promise<E>;
    save: (entity: E) => Promise<E>;
}

/** Classe de base pour un composant Focus avec un formulaire. */
@autobind
export abstract class AutoForm<P, E> extends React.Component<P & AutoFormProps, {}> {
    static defaultProps = {
        hasForm: true,
        hasEdit: true,
        hasDelete: false,
        hasLoad: true,
        isEdit: false
    };

    protected action: ActionConfig<E>;
    protected entity: E;
    @observable protected errors: {[key: string]: string} = {};
    @observable protected formState: E;
    @observable protected isEdit = this.props.isEdit || false;
    @observable protected isLoading = false;

    @action
    async componentWillMount() {
        this.formState = this.entity;
        let {hasLoad = true, id} = this.props;
        if (hasLoad && id) {
            this.isLoading = true;
            const data = await this.action.load(id);
            runInAction(() => {
                this.entity = data;
                this.isLoading = false;
            });
        }
    }

    /**
     * Crée un champ de type AutocompleteSelect.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    autocompleteSelectFor<T, Props>(field: EntityField<T>, options: AutocompleteSelectOptions<Props> & Props) {
        options.isEdit = this.isEdit;
        options.error = this.errors[field.$entity.name];
        return autocompleteSelectFor(field, options);
    }

    /**
     * Crée un champ de type AutocompleteText.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    autocompleteTextFor<T, Props>(field: EntityField<T>, options: AutocompleteTextOptions<Props> & Props) {
        options.isEdit = this.isEdit;
        options.error = this.errors[field.$entity.name];
        return autocompleteTextFor(field, options);
    }

    /**
     * Crée un champ standard en lecture seule.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    displayFor<T, Props>(field: EntityField<T>, options: DisplayOptions<Props> & Props = {} as any) { return displayFor(field, options); }

    /**
     * Crée un champ standard.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    fieldFor<T, DisplayProps, FieldProps, InputProps, InputLabelProps>(
        field: EntityField<T>,
        options: FieldOptions<DisplayProps, FieldProps, InputProps, InputLabelProps> & DisplayProps & FieldProps & InputProps & InputLabelProps = {} as any
    ) {
        options.isEdit = this.isEdit;
        options.error = this.errors[field.$entity.name];
        return fieldFor(field, options);
    }

    /**
     * Crée un champ avec résolution de référence.
     * @param field La définition de champ.
     * @param listName Le nom de la liste de référence.
     * @param options Les options du champ.
     */
    selectFor<T, Props>(field: EntityField<T>, values: T[], options: SelectOptions<T, Props> & Props = {} as any) {
        options.isEdit = this.isEdit;
        options.error = this.errors[field.$entity.name];
        return selectFor(field, values, options);
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
     * Handler du bouton d'annulation.
     * Repasse le formulaire en consulation et récupère l'état du store.
     */
    @action
    onClickCancel() {
        this.errors = {};
        this.isEdit = false;
        this.formState = this.entity;
        applicationStore.changeMode("consult", "edit");
    }

    /**
     * Handler du bouton de suppression.
     * Appelle l'action de suppression.
     */
    @action
    async onClickDelete() {
        if (this.action.delete) {
            this.isLoading = true;
            await this.action.delete(this.formState);
            runInAction(() => {
                this.isLoading = false;
                this.entity = {} as E;
                this.formState = {} as E;
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
        if (this.validate()) {
            this.isLoading = true;
            const data = await this.action.save(this.formState);
            runInAction(() => {
                this.isLoading = false;
                this.entity = data;
            });
        }
    }

    /** Retourne les actions du formulaire. */
    renderActions() {
        return this.isEdit ? this.renderEditActions() : this.renderConsultActions();
    }

    /** Retoune les actions en consulation du formualaire. */
    renderConsultActions() {
        let {hasEdit = true, hasDelete = false} = this.props;
        return (
            <div>
                {hasEdit && this.buttonEdit}
                {hasDelete && this.buttonDelete}
            </div>
        );
    }

    /** Retourne les action en édition du formulaire. */
    renderEditActions() {
        return (
            <span>
                {this.buttonSave}
                {this.buttonCancel}
            </span>
        );
    }

    validate() {
        let validationMap: { [key: string]: string } = {};
        for (let inptKey in this.refs) {
            if (isFunction((this.refs[inptKey] as any).validate)) {
                let validationRes = (this.refs[inptKey] as any).validate();
                if (validationRes !== undefined) {
                    validationMap[inptKey] = validationRes;
                }
            }
        }

        if (isEmpty(validationMap)) {
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

    private get className() {
        return `form-horizontal ${this.props.style && this.props.style.className || ""}`;
    }

    private get mode() {
        return `${this.isEdit ? "edit" : "consult"}`;
    }

    private handleSubmitForm(e: React.FormEvent<any>) {
        e.preventDefault();
        this.onClickSave();
    }

    abstract renderContent(): React.ReactElement<any> | null;
    render() {
        if (this.props.hasForm) {
            return (
                <form
                    className={this.className}
                    data-loading={this.isLoading}
                    data-mode={this.mode}
                    noValidate={true}
                    onSubmit={this.handleSubmitForm}
                >
                    <fieldset>{this.renderContent()}</fieldset>
                </form>
            );
        } else {
            return this.renderContent();
        }
    }
}

/*
    function dispatchFieldErrors(errorResult: FieldErrors | undefined) {
        const data: {[key: string]: {[key: string]: string[]}} = isArray(node) ? errorResult as any : {[node]: errorResult} as any;
        const errorStatus = {name: "error", isLoading: false};
        let newStatus: {[key: string]: typeof errorStatus} = {};
        if (isArray(node)) {
            node.forEach(nd => newStatus[nd] = errorStatus);
        } else {
            newStatus[node] = errorStatus;
        }
        dispatcher.handleServerAction({
            data,
            type: "updateError",
            status: newStatus,
            callerId
        });
    }
*/
