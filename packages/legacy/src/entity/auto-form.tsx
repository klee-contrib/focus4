import {some, values as _values} from "lodash";
import {action, comparer, computed, Lambda, observable, reaction, runInAction} from "mobx";
import * as React from "react";
import {v4} from "uuid";

import {classAutorun, messageStore} from "@focus4/core";
import {formStyles} from "@focus4/forms";
import {
    EntityField,
    FieldEntry,
    FieldEntryType,
    isStoreListNode,
    StoreListNode,
    StoreNode,
    toFlatValues
} from "@focus4/stores";
import {themr} from "@focus4/styling";

import {DisplayProps, InputProps, LabelProps, PanelProps, SelectProps} from "../components";

import {Field, FieldProps} from "./field";
import {displayFor, fieldFor, isField, selectFor} from "./field-helpers";
import {createViewModel, ViewModel} from "./view-model";

const Theme = themr("form", formStyles);

/** Options additionnelles de l'AutoForm. */
export interface AutoFormOptions<ST extends StoreNode | StoreListNode> {
    /** Pour ajouter une classe particulière sur le formulaire. */
    className?: string;

    /** ViewModel externe de `storeData`, s'il y a besoin d'externaliser le state interne du formulaire. */
    entity?: ST & ViewModel;

    /** Par défaut: true */
    hasForm?: boolean;

    /** Préfixe i18n pour les messages du formulaire (par défaut: "focus") */
    i18nPrefix?: string;

    /** Par défaut: false */
    initiallyEditing?: boolean;
}

/** Config de services à fournir à AutoForm. */
export interface ServiceConfig<T, LP> {
    /** Service de suppression. */
    delete?: (entity: T) => Promise<void | number | boolean>;

    /** Fonction pour récupérer la liste des paramètres pour le service de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => LP[] | undefined;

    /** Service de chargement. */
    load?: (...args: LP[]) => Promise<T>;

    /** Service de sauvegarde. Obligatoire. */
    save: (entity: T) => Promise<T>;
}

/** Classe de base pour un créer un composant avec un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
export abstract class AutoForm<P, ST extends StoreNode | StoreListNode> extends React.Component<P> {
    /** Map de tous les formulaires actuellement affichés avec leur état en édition */
    static readonly editingMap = observable.map<string, boolean>();

    /** Précise si au moins un formulaire de l'application est en édition. */
    @computed
    static get isOneEdit() {
        return Array.from(AutoForm.editingMap.values()).some(x => x);
    }

    /** Identifiant unique du formulaire. */
    formId = v4();

    /** Etat courant du formulaire, copié depuis `storeData`. Sera réinitialisé à chaque modification de ce dernier. */
    entity!: ST & ViewModel;

    /** Services. */
    services!: ServiceConfig<any, any>;

    /** Noeud de store à partir du quel le formulaire a été créé. */
    storeData!: ST;

    /** Erreurs sur les champs issues du serveur. */
    @observable errors: Record<string, string> = {};

    /** Reférences vers les champs placés par `this.fieldFor` (pour la validation). */
    @observable fields: Record<string, Field<any, any, any, any, any, any, any> | null> = {};

    /** Formulaire en édition. */
    @observable isEdit!: boolean;

    /** Formulaire en chargement. */
    @observable isLoading = false;

    /** Classe CSS additionnelle (passée en options). */
    private className!: string;

    /** Insère ou non un formulaire HTML. */
    private hasForm!: boolean;

    /** Préfixe i18n pour les messages du formulaire */
    private i18nPrefix!: string;

    /** Utilise ou non un ViewModel personnalisé, passé en options. */
    private isCustomEntity!: boolean;

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
    formInit(
        storeData: ST,
        services: ServiceConfig<any, any>,
        {entity, className, hasForm, i18nPrefix, initiallyEditing}: AutoFormOptions<ST> = {}
    ) {
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
            this.loadDisposer = reaction(services.getLoadParams, () => this.load(), {equals: comparer.structural});
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
                    if (isStoreListNode(this.storeData)) {
                        this.storeData.replaceNodes(data || []);
                    } else {
                        this.storeData.replace(data || {});
                    }
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
            this.isLoading = true;
            try {
                const data = await this.services.save(toFlatValues(this.entity));
                runInAction(() => {
                    this.isLoading = false;
                    this.isEdit = false;
                    // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                    if (isStoreListNode(this.storeData)) {
                        this.storeData.replaceNodes(data);
                    } else {
                        this.storeData.replace(data);
                    }
                });
                this.onFormSaved();
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
        messageStore.addSuccessMessage(`${this.i18nPrefix}.detail.deleted`);
    }

    /** Est appelé après le chargement. */
    onFormLoaded() {
        // A éventuellement surcharger.
    }

    /** Est appelé après la sauvegarde. */
    onFormSaved() {
        messageStore.addSuccessMessage(`${this.i18nPrefix}.detail.saved`);
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
    getPanelProps(): PanelProps {
        return {
            editing: this.isEdit,
            loading: this.isLoading,
            save: this.hasForm ? undefined : () => this.save(),
            onClickCancel: () => this.toggleEdit(false),
            onClickEdit: () => this.toggleEdit(true)
        };
    }

    /** Fonction de rendu du formulaire à préciser. */
    abstract renderContent(): React.ReactElement | null;
    render() {
        if (this.hasForm) {
            return (
                <Theme theme={{form: this.className}}>
                    {theme => (
                        <form
                            className={theme.form}
                            onSubmit={e => {
                                e.preventDefault();
                                this.save();
                            }}
                        >
                            <fieldset>{this.renderContent()}</fieldset>
                        </form>
                    )}
                </Theme>
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
    displayFor<T extends string | number | boolean, DCProps = DisplayProps, LCProps = LabelProps>(
        field: T,
        options?: Partial<FieldProps<T, any, DCProps, LCProps>>
    ): JSX.Element;
    displayFor<
        T,
        DCDomainProps = DisplayProps,
        LCDomainProps = LabelProps,
        DCProps = DCDomainProps,
        LCProps = LCDomainProps
    >(
        field: EntityField<FieldEntry<T, FieldEntryType<T>, any, any, any, DCDomainProps, LCDomainProps>>,
        options?: Partial<FieldProps<T, any, DCProps, LCProps>>
    ): JSX.Element;
    displayFor<
        T,
        DCDomainProps = DisplayProps,
        LCDomainProps = LabelProps,
        DCProps = DCDomainProps,
        LCProps = LCDomainProps
    >(
        field: EntityField<FieldEntry<T, FieldEntryType<T>, any, any, any, DCDomainProps, LCDomainProps>> | T,
        options: Partial<FieldProps<T, any, DCProps, LCProps>> = {}
    ) {
        return displayFor(field as any, options);
    }

    /**
     * Crée un champ standard.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    fieldFor<T extends string | number | boolean, ICProps = InputProps, DCProps = DisplayProps, LCProps = LabelProps>(
        field: T,
        options?: Partial<FieldProps<T, ICProps, DCProps, LCProps>>
    ): JSX.Element;
    fieldFor<
        T,
        ICDomainProps = InputProps,
        DCDomainProps = DisplayProps,
        LCDomainProps = LabelProps,
        ICProps = ICDomainProps,
        DCProps = DCDomainProps,
        LCProps = LCDomainProps
    >(
        field: EntityField<FieldEntry<T, FieldEntryType<T>, ICDomainProps, any, any, DCDomainProps, LCDomainProps>>,
        options?: Partial<FieldProps<T, ICProps, DCProps, LCProps>>
    ): JSX.Element;
    fieldFor<
        T,
        ICDomainProps = InputProps,
        DCDomainProps = DisplayProps,
        LCDomainProps = LabelProps,
        ICProps = ICDomainProps,
        DCProps = DCDomainProps,
        LCProps = LCDomainProps
    >(
        field: EntityField<FieldEntry<T, FieldEntryType<T>, ICDomainProps, any, any, DCDomainProps, LCDomainProps>> | T,
        options: Partial<FieldProps<T, ICProps, DCProps, LCProps>> = {}
    ) {
        return fieldFor(field as any, this.setFieldOptions(field, options));
    }

    /**
     * Crée un champ avec résolution de référence.
     * @param field La définition de champ.
     * @param listName Le nom de la liste de référence.
     * @param options Les options du champ.
     */
    selectFor<
        T,
        DCDomainProps = DisplayProps,
        LCDomainProps = LabelProps,
        ICProps = Partial<SelectProps>,
        DCProps = DCDomainProps,
        LCProps = LCDomainProps,
        R = any,
        ValueKey extends string = "code",
        LabelKey extends string = "label"
    >(
        field: EntityField<FieldEntry<T, FieldEntryType<T>, any, any, any, DCDomainProps, LCDomainProps>>,
        values: R[],
        options: Partial<FieldProps<T, ICProps, DCProps, LCProps, R, ValueKey, LabelKey>> = {}
    ) {
        return selectFor(field, values as any, this.setFieldOptions(field, options));
    }

    /**
     * Ajoute les options aux champs pour les lier au formulaire (`ref`, `error`, `isEdit`).
     * @param field La définition du champ.
     * @param options Les options du champ.
     */
    private setFieldOptions<T, IC, DC, LC>(
        field: EntityField<FieldEntry<T>> | T,
        options: Partial<FieldProps<T, IC, DC, LC>>
    ) {
        if (options.isEdit === undefined) {
            options.isEdit = this.isEdit;
        }

        if (isField(field)) {
            if (!options.ref) {
                options.ref = f => (this.fields[field.$field.label] = f);
            }
            if (!options.error) {
                options.error = this.errors[field.$field.label];
            }
        }

        return options;
    }
}
