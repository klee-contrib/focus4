import {autobind} from "core-decorators";
import {some, values as _values} from "lodash";
import {action, computed, Lambda, observable, ObservableMap, reaction, runInAction} from "mobx";
import * as PropTypes from "prop-types";
import * as React from "react";
import {InputProps} from "react-toolbox/lib/input";
import {v4} from "uuid";

import {DisplayProps, PanelProps, SelectProps} from "../components";
import {messageStore} from "../message";
import {classAutorun} from "../util";

import {Field, FieldProps, RefValues} from "./field";
import {StoreNode, toFlatValues} from "./store";
import {BaseDisplayProps, BaseInputProps, BaseLabelProps, Domain, EntityField} from "./types";
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
    getLoadParams?: () => any[] | undefined;

    /** Service de chargement. */
    load?: (...args: any[]) => Promise<{} | undefined>;

    /** Service de sauvegarde. Obligatoire. */
    save: (entity: {}) => Promise<{}>;
}

/** Classe de base pour un créer un composant avec un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
@autobind
export abstract class AutoForm<P, E extends StoreNode> extends React.Component<P, void> {

    /** Map de tous les formulaires actuellement affichés avec leur état en édition */
    static readonly editingMap: ObservableMap<boolean> = observable.map<boolean>();

    /** Précise si au moins un formulaire de l'application est en édition. */
    @computed
    static get isOneEdit() {
        return AutoForm.editingMap.values().some(x => x);
    }

    // On ne peut pas injecter le contexte dans le form (héritage...) donc on va le chercher directement pour le style CSS.
    static contextTypes = {theme: PropTypes.object};
    context: {theme: {[key: string]: {[key: string]: any}}};

    /** Identifiant unique du formulaire. */
    formId = v4();

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
        AutoForm.editingMap.set(this.formId, this.isEdit);
        this.entity.subscribe(); // On force l'abonnement à `this.storeData` au cas-où.
        this.load();
    }

    componentWillUnmount() {
        AutoForm.editingMap.delete(this.formId);
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
        AutoForm.editingMap.set(this.formId, this.isEdit);
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
            });
            this.onFormDeleted();
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
                });
                this.onFormLoaded();
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
                });
                this.onFormSaved();
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
            if (this.fields[field]) {
                this.fields[field]!.showError = true;
            }
        }

        // La validation est en succès si chaque champ n'est pas en erreur.
        return !some(_values(this.fields), field => field && field.error);
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons au formulaire. */
    getPanelProps(): PanelProps & {getUserInput?: any} {
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
    displayFor<DCProps extends BaseDisplayProps = DisplayProps, LCProps extends BaseLabelProps = BaseLabelProps>(
        field: string | number,
        options?: Partial<FieldProps<string | number, {}, DCProps, LCProps, {}, string, string>>
    ): JSX.Element;
    displayFor<T, DCDomainProps extends BaseDisplayProps = DisplayProps, LCDomainProps extends BaseLabelProps = BaseLabelProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
        field: EntityField<T, Domain<{}, DCDomainProps, LCDomainProps>>,
        options?: Partial<FieldProps<T, {}, DCProps, LCProps, {}, string, string>>
    ): JSX.Element;
    displayFor<T, DCDomainProps extends BaseDisplayProps = DisplayProps, LCDomainProps extends BaseLabelProps = BaseLabelProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
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
    fieldFor<ICProps extends BaseInputProps = InputProps, DCProps extends BaseDisplayProps = DisplayProps, LCProps extends BaseLabelProps = BaseLabelProps>(
        field: string | number,
        options?: Partial<FieldProps<string | number, ICProps, DCProps, LCProps, {}, string, string>>
    ): JSX.Element;
    fieldFor<T, ICDomainProps extends BaseInputProps = InputProps, DCDomainProps extends BaseDisplayProps = DisplayProps, LCDomainProps extends BaseLabelProps = BaseLabelProps, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
        field: EntityField<T, Domain<ICDomainProps, DCDomainProps, LCDomainProps>>,
        options?: Partial<FieldProps<T, ICProps, DCProps, LCProps, {}, string, string>>
    ): JSX.Element;
    fieldFor<T, ICDomainProps extends BaseInputProps = InputProps, DCDomainProps extends BaseDisplayProps = DisplayProps, LCDomainProps extends BaseLabelProps = BaseLabelProps, ICProps = ICDomainProps, DCProps = DCDomainProps, LCProps = LCDomainProps>(
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
    selectFor<T, DCDomainProps extends BaseDisplayProps = DisplayProps, LCDomainProps extends BaseLabelProps = BaseLabelProps, ICProps extends BaseInputProps = Partial<SelectProps>, DCProps = DCDomainProps, LCProps = LCDomainProps, R extends RefValues<T, ValueKey, LabelKey> = any, ValueKey extends string = "code", LabelKey extends string = "label">(
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
     * Ajoute les options aux champs pour les lier au formulaire (`ref`, `error`, `isEdit`).
     * @param field La définition du champ.
     * @param options Les options du champ.
     */
    private setFieldOptions<T>(field: EntityField<T> | T, options: Partial<FieldProps<T, {}, {}, {}, {}, string, string>>) {
        if (options.isEdit === undefined) {
            options.isEdit = this.isEdit;
        }

        if (isField(field)) {
            options.innerRef = f => this.fields[field.$entity.translationKey] = f;
            if (!options.error) {
                options.error = this.errors[field.$entity.translationKey];
            }
        }

        return options;
    }
}

export default AutoForm;
