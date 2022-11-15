import {action, comparer, computed, Lambda, makeObservable, observable, reaction, runInAction} from "mobx";
import {Component, ReactElement} from "react";
import {v4} from "uuid";

import {messageStore} from "@focus4/core";
import {
    AutocompleteProps,
    AutocompleteResult,
    DisplayProps,
    fieldFor,
    FieldOptions,
    Form,
    InputProps,
    LabelProps,
    PanelProps,
    SelectProps
} from "@focus4/forms";
import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    DomainType,
    EntityField,
    FieldEntry,
    fromField,
    isStoreListNode,
    Metadata,
    ReferenceList,
    StoreListNode,
    StoreNode,
    toFlatValues
} from "@focus4/stores";

import {classAutorun} from "../reactions";

import {fieldWrapperFor} from "./field-wrapper";
import {createViewModel, ViewModel} from "./view-model";

/** Options additionnelles de l'AutoForm. */
export interface AutoFormOptions<ST extends StoreListNode | StoreNode> {
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
    delete?: (entity: T) => Promise<boolean | number | void>;

    /** Fonction pour récupérer la liste des paramètres pour le service de chargement. Si le résultat contient des observables, le service de chargement sera rappelé à chaque modification. */
    getLoadParams?: () => LP[] | undefined;

    /** Service de chargement. */
    load?: (...args: LP[]) => Promise<T>;

    /** Service de sauvegarde. Obligatoire. */
    save: (entity: T) => Promise<T>;
}

/** Classe de base pour un créer un composant avec un formulaire. A n'utiliser QUE pour des formulaires (avec de la sauvegarde). */
export abstract class AutoForm<P, ST extends StoreListNode | StoreNode> extends Component<P> {
    /** Map de tous les formulaires actuellement affichés avec leur état en édition */
    static readonly editingMap = observable.map<string, boolean>();

    /** Identifiant unique du formulaire. */
    formId = v4();

    /** Etat courant du formulaire, copié depuis `storeData`. Sera réinitialisé à chaque modification de ce dernier. */
    entity!: ST & ViewModel;

    /** Services. */
    services!: ServiceConfig<any, any>;

    /** Noeud de store à partir du quel le formulaire a été créé. */
    storeData!: ST;

    /** Erreurs sur les champs. */
    readonly errors = new Map<string, string | undefined>();

    /** Force l'affichage des erreurs. */
    @observable forceErrorDisplay = false;

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

    constructor(props: P) {
        super(props);
        makeObservable(this);
    }

    UNSAFE_componentWillMount() {
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

    /** Précise si au moins un formulaire de l'application est en édition. */
    @computed
    static get isOneEdit() {
        return Array.from(AutoForm.editingMap.values()).some(x => x);
    }

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
        this.entity = entity ?? createViewModel(storeData);
        this.isCustomEntity = entity !== undefined;
        this.isEdit = initiallyEditing ?? false;
        this.hasForm = hasForm ?? true;
        this.className = className ?? "";
        this.i18nPrefix = i18nPrefix ?? "focus";

        // On met en place la réaction de chargement.
        if (services.getLoadParams) {
            this.loadDisposer = reaction(services.getLoadParams, () => this.load(), {equals: comparer.structural});
        }
    }

    /** Change le mode du formulaire. */
    @action
    toggleEdit = (isEdit: boolean) => {
        this.isEdit = isEdit;
        if (!isEdit) {
            this.entity.reset();
        }
    };

    @classAutorun protected updateApplicationStore() {
        AutoForm.editingMap.set(this.formId, this.isEdit);
    }

    /** Appelle le service de suppression. */
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
            } catch (e: unknown) {
                runInAction(() => {
                    this.isLoading = false;
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
    validate() {
        // On force en premier lieu l'affichage des erreurs sur tous les champs.
        this.forceErrorDisplay = true;

        // La validation est en succès si chaque champ n'est pas en erreur.
        return !Array.from(this.errors.values()).some(e => !!e);
    }

    /** Récupère les props à fournir à un Panel pour relier ses boutons au formulaire. */
    getPanelProps(): PanelProps {
        return {
            editing: this.isEdit,
            loading: this.isLoading,
            save: () => this.save(),
            onClickCancel: () => this.toggleEdit(false),
            onClickEdit: () => this.toggleEdit(true)
        };
    }

    /**
     * Crée un champ standard en lecture seule.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    displayFor<
        DT extends "boolean" | "number" | "object" | "string",
        T extends DomainType<DT>,
        DCDProps extends BaseDisplayProps = DisplayProps,
        LCDProps extends BaseLabelProps = LabelProps,
        DCProps extends BaseDisplayProps = DCDProps,
        LCProps extends BaseLabelProps = LCDProps
    >(
        field: EntityField<FieldEntry<DT, T, any, any, any, DCDProps, LCDProps>>,
        options: FieldOptions<FieldEntry<DT, T, any, any, any, DCDProps, LCDProps>> &
            Omit<Metadata<T, any, any, any, DCProps, LCProps>, "fieldProps"> = {}
    ): JSX.Element {
        const {
            AutocompleteComponent,
            DisplayComponent,
            InputComponent,
            LabelComponent,
            SelectComponent,
            displayFormatter,
            label,
            validator,
            ...fieldOptions
        } = options;
        return fieldFor(
            fromField(field, {
                DisplayComponent: DisplayComponent ?? (field.$field.domain.DisplayComponent as any),
                displayFormatter: displayFormatter ?? field.$field.domain.displayFormatter,
                label: label ?? field.$field.label
            }),
            fieldOptions as any
        );
    }

    /**
     * Crée un champ autocomplete.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    autocompleteFor<
        DT extends "boolean" | "number" | "object" | "string",
        T extends DomainType<DT>,
        ACDProps extends BaseAutocompleteProps = AutocompleteProps<DT extends "number" ? "number" : "string">,
        DCDProps extends BaseDisplayProps = DisplayProps,
        LCDProps extends BaseLabelProps = LabelProps,
        ACProps extends BaseAutocompleteProps = ACDProps,
        DCProps extends BaseDisplayProps = DCDProps,
        LCProps extends BaseLabelProps = LCDProps
    >(
        field: EntityField<FieldEntry<DT, T, any, any, ACDProps, DCDProps, LCDProps>>,
        options: FieldOptions<FieldEntry<DT, T, any, any, ACDProps, DCDProps, LCDProps>> &
            Omit<Metadata<T, any, any, ACProps, DCProps, LCProps>, "fieldProps"> & {
                error?: string;
                isEdit?: boolean;
                name?: string;
                keyResolver?: (key: T) => Promise<string | undefined>;
                querySearcher?: (text: string) => Promise<AutocompleteResult | undefined>;
            } = {}
    ): JSX.Element {
        const {name, ...o} = options;
        return fieldWrapperFor(
            "autocomplete",
            field,
            this.isEdit,
            e => this.errors.set(name ?? field.$field.name, e),
            o as any
        );
    }

    /**
     * Crée un champ standard.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    fieldFor<
        DT extends "boolean" | "number" | "object" | "string",
        T extends DomainType<DT>,
        ICDProps extends BaseInputProps = InputProps<DT extends number ? "number" : "string">,
        DCDProps extends BaseDisplayProps = DisplayProps,
        LCDProps extends BaseLabelProps = LabelProps,
        ICProps extends BaseInputProps = ICDProps,
        DCProps extends BaseDisplayProps = DCDProps,
        LCProps extends BaseLabelProps = LCDProps
    >(
        field: EntityField<FieldEntry<DT, T, ICDProps, any, any, DCDProps, LCDProps>>,
        options: FieldOptions<FieldEntry<DT, T, ICDProps, any, any, DCDProps, LCDProps>> &
            Omit<Metadata<T, ICProps, any, any, DCProps, LCProps>, "fieldProps"> & {
                error?: string;
                isEdit?: boolean;
                name?: string;
            } = {}
    ): JSX.Element {
        const {name, ...o} = options;
        return fieldWrapperFor(
            "input",
            field,
            this.isEdit,
            e => this.errors.set(name ?? field.$field.name, e),
            o as any
        );
    }

    /**
     * Crée un champ select.
     * @param field La définition de champ.
     * @param values Liste de référence.
     * @param options Les options du champ.
     */
    selectFor<
        DT extends "boolean" | "number" | "object" | "string",
        T extends DomainType<DT>,
        SCDProps extends BaseSelectProps = SelectProps<DT extends "number" ? "number" : "string">,
        DCDProps extends BaseDisplayProps = DisplayProps,
        LCDProps extends BaseLabelProps = LabelProps,
        SCProps extends BaseSelectProps = SCDProps,
        DCProps extends BaseDisplayProps = DCDProps,
        LCProps extends BaseLabelProps = LCDProps
    >(
        field: EntityField<FieldEntry<DT, T, any, SCDProps, any, DCDProps, LCDProps>>,
        values: ReferenceList,
        options: FieldOptions<FieldEntry<DT, T, any, SCDProps, any, DCDProps, LCDProps>> &
            Omit<Metadata<T, any, SCProps, any, DCProps, LCProps>, "fieldProps"> & {
                error?: string;
                isEdit?: boolean;
                name?: string;
            } = {}
    ): JSX.Element {
        const {name, ...o} = options;
        return fieldWrapperFor(
            "select",
            field,
            this.isEdit,
            e => this.errors.set(name ?? field.$field.name, e),
            o as any,
            values
        );
    }

    /** Fonction de rendu du formulaire à préciser. */
    abstract renderContent(): ReactElement | null;
    render() {
        return (
            <Form
                forceErrorDisplay={this.forceErrorDisplay}
                noForm={!this.hasForm}
                save={() => this.save()}
                theme={{form: this.className}}
            >
                {this.renderContent()}
            </Form>
        );
    }
}
