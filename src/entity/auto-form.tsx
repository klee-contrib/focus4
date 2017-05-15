import {autobind} from "core-decorators";
import {some, values} from "lodash";
import {action, Lambda, observable, reaction, runInAction} from "mobx";
import * as React from "react";
import {v4} from "uuid";

import {DisplayTextProps} from "focus-components/input-display/text";
import {InputTextProps} from "focus-components/input-text";
import {LabelProps} from "focus-components/label";
import {PanelButtonsProps} from "focus-components/panel/edit-save-buttons";
import {SelectProps} from "focus-components/select";

import {applicationStore} from "../application";
import {messageStore} from "../message";
import {classAutorun} from "../util";

import { Field, FieldProps, RefValues } from "./field";
import {StoreNode, toFlatValues} from "./store";
import {BaseDisplayProps, BaseInputProps, Domain, EntityField} from "./types";
import {createViewModel, ViewModel} from "./view-model";

import {
    displayFor,
    fieldFor,
    isField,
    selectFor,
    stringFor,
} from "./field-helpers";

import {form} from "./__style__/auto-form.css";

/** Options additionnelles de l'AutoForm. */
export interface AutoFormOptions<E> {

    /** Pour ajouter une classe particulière sur le formulaire. */
    className?: string;

    /** ViewModel externe de `storeData`, s'il y a besoin d'externaliser le state interne du formulaire. */
    entity?: E & ViewModel;

    /** Par défaut: true */
    hasForm?: boolean;

    /** Préfixe i18n pour les messages du formulaire (par défaut: "focus") */
    i18nPrefix?: string;

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
    load?: (...args: any[]) => Promise<{} | undefined>;

    /** Service de sauvegarde. Obligatoire. */
    save: (entity: {}) => Promise<{}>;
}

/** Classe de base pour un créer un composant avec un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
@autobind
export abstract class AutoForm<P, E extends StoreNode<{}>> extends React.Component<P, void> {

    // On ne peut pas injecter le contexte dans le form (héritage...) donc on va le chercher directement pour le style CSS.
    static contextTypes = {classNames: React.PropTypes.object};
    context: {theme: {[key: string]: {[key: string]: any}}};

    /** Etat courant du formulaire, copié depuis `storeData`. Sera réinitialisé à chaque modification de ce dernier. */
    entity: E & ViewModel;

    /** Services. */
    services: ServiceConfig;

    /** Noeud de store à partir du quel le formulaire a été créé. */
    storeData: E;

    /** Erreurs sur les champs issues du serveur. */
    @observable errors: Record<string, string> = {};

    /** Reférences vers les champs placés par `this.fieldFor` (pour la validation). */
    @observable fields: Record<string, Field<any, any, any, any, any, any, any> | null> = {};

    /** Formulaire en édition. */
    @observable isEdit: boolean;

    /** Formulaire en chargement. */
    @observable isLoading = false;

    /** Formulaire en sauvegarde.  */
    @observable isSaving = false;

    /** Classe CSS additionnelle (passée en options). */
    private className: string;

    /** Identifiant unique du formulaire, pour l'ApplicationStore. */
    private formId = v4();

    /** Insère ou non un formulaire HTML. */
    private hasForm: boolean;

    /** Préfixe i18n pour les messages du formulaire */
    private i18nPrefix: string;

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
    formInit(storeData: E, services: ServiceConfig, {entity, className, hasForm, i18nPrefix, initiallyEditing}: AutoFormOptions<E> = {}) {
        this.storeData = storeData;
        this.services = services;
        this.entity = entity || createViewModel(storeData);
        this.isCustomEntity = entity !== undefined;
        this.isEdit = initiallyEditing || false;
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
        applicationStore.forms.set(this.formId, this.isEdit);
        this.entity.subscribe(); // On force l'abonnement à `this.storeData` au cas-où.
        this.load();
    }

    componentWillUnmount() {
        applicationStore.forms.delete(this.formId);
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
        if (!isEdit) {
            this.entity.reset();
        }
    }

    @classAutorun protected updateApplicationStore() {
        applicationStore.forms.set(this.formId, this.isEdit);
    }

    /** Appelle le service de suppression. */
    @action
    async delete() {
        if (this.services.delete) {
            this.isLoading = true;
            await this.services.delete(toFlatValues(this.entity));
            messageStore.addSuccessMessage(`${this.i18nPrefix}.detail.deleted`);
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
                    this.storeData.set(data || {});
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
            this.isSaving = true;
            try {
                const data = await this.services.save(toFlatValues(this.entity));
                messageStore.addSuccessMessage(`${this.i18nPrefix}.detail.saved`);
                runInAction(() => {
                    this.isSaving = false;
                    this.isEdit = false;
                    this.storeData.set(data); // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                    this.onFormSaved();
                });
            } catch (e) {
                runInAction(() => {
                    this.isSaving = false;
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
            loading: this.isLoading,
            save: this.save,
            saving: this.isSaving,
            toggleEdit: this.toggleEdit,
        };
    }

    /** Fonction de rendu du formulaire à préciser. */
    abstract renderContent(): React.ReactElement<any> | null;
    render() {
        const contextClassName = this.context && this.context.theme && this.context.theme["form"] || "";
        if (this.hasForm) {
            return (
                <form
                    className={`${form} ${contextClassName} ${this.className}`}
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
     * Crée un champ standard en lecture seule.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    displayFor<DCProps extends BaseDisplayProps = DisplayTextProps, LCProps = Partial<LabelProps>>(
        field: string | number,
        options?: Partial<FieldProps<string | number, {}, DCProps, LCProps, {}, string, string>>
    ): JSX.Element;
    displayFor<T, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, DCProps = DCDomainProps, LCProps = LCDomainProps>(
        field: EntityField<T, Domain<{}, DCDomainProps, LCDomainProps>>,
        options?: Partial<FieldProps<T, {}, DCProps, LCProps, {}, string, string>>
    ): JSX.Element;
    displayFor<T, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, DCProps = DCDomainProps, LCProps = LCDomainProps>(
        field: EntityField<T, Domain<{}, DCDomainProps, LCDomainProps>> | T,
        options: Partial<FieldProps<T, {}, DCProps, LCProps, {}, string, string>> = {}
    ) {
        return displayFor(field as any, options);
    }

    /**
     * Crée un champ standard.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    fieldFor<ICProps extends BaseInputProps = InputTextProps, DCProps extends BaseDisplayProps = DisplayTextProps, LCProps = Partial<LabelProps>>(
        field: string | number,
        options?: Partial<FieldProps<string | number, ICProps, DCProps, LCProps, {}, string, string>>
    ): JSX.Element;
    fieldFor<T, ICDomainProps extends BaseInputProps = InputTextProps, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
        field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>,
        options?: Partial<FieldProps<T, ICProps, DCProps, LCProps, {}, string, string>>
    ): JSX.Element;
    fieldFor<T, ICDomainProps extends BaseInputProps = InputTextProps, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
        field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>> | T,
        options: Partial<FieldProps<T, ICProps, DCProps, LCProps, {}, string, string>> = {}
    ) {
        return fieldFor(field as any, this.setFieldOptions(field, options));
    }

    /**
     * Crée un champ avec résolution de référence.
     * @param field La définition de champ.
     * @param listName Le nom de la liste de référence.
     * @param options Les options du champ.
     */
    selectFor<T, DCDomainProps extends BaseDisplayProps = DisplayTextProps, LCDomainProps = Partial<LabelProps>, ICProps extends BaseInputProps = Partial<SelectProps>, DCProps = DCDomainProps, LCProps = LCDomainProps, R extends RefValues<T, ValueKey, LabelKey> = any, ValueKey extends string = "code", LabelKey extends string = "label">(
        field: EntityField<T, Domain<{}, DCDomainProps, LCDomainProps>>,
        values: R[],
        options: Partial<FieldProps<T, ICProps, DCProps, LCProps, R, ValueKey, LabelKey>> = {}
    ) {
        return selectFor(field, values as any, this.setFieldOptions<T>(field, options as any) as any);
    }

    /**
     * Récupère le texte correspondant à un champ.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    stringFor<T, R extends RefValues<T, ValueKey, LabelKey>, ValueKey extends string = "code", LabelKey extends string = "label">(
        field: EntityField<T>,
        options: Partial<FieldProps<T, {}, {}, {}, R, ValueKey, LabelKey>> = {}
    ) {
        return stringFor(field, options);
    }

    /**
     * Ajoute les options aux champs pour les lier au formulaire (`ref`, `error`, `isEdit` et `onChange`).
     * @param field La définition du champ.
     * @param options Les options du champ.
     */
    private setFieldOptions<T>(field: EntityField<T> | T, options: Partial<FieldProps<T, {}, {}, {}, {}, string, string>>) {
        if (options.isEdit === undefined) {
            options.isEdit = this.isEdit;
        }

        if (isField(field)) {
            options.innerRef = f => this.fields[field.$entity.translationKey] = f;
            options.error = this.errors[field.$entity.translationKey];
        }

        return options;
    }
}
