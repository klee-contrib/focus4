import {action, comparer, computed, Lambda, makeObservable, observable, reaction, runInAction} from "mobx";
import {Component, ReactElement} from "react";
import {v4} from "uuid";

import {messageStore} from "@focus4/core";
import {fieldFor, FieldOptions, Form} from "@focus4/forms";
import {PanelProps} from "@focus4/layout";
import {
    BaseAutocompleteProps,
    BaseDisplayProps,
    BaseInputProps,
    BaseLabelProps,
    BaseSelectProps,
    DomainFieldType,
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

    /** Mode d'affichage des erreurs du formulaire. */
    errorDisplay?: "after-focus" | "always" | "never";
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
    @observable errorDisplay!: "after-focus" | "always" | "never";

    /** Formulaire en édition. */
    @observable isEdit!: boolean;

    /** Formulaire en chargement. */
    @observable isLoading = false;

    private actionsErrorDisplay!: "after-focus" | "always" | "never";

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
        {entity, className, hasForm, i18nPrefix, initiallyEditing, errorDisplay}: AutoFormOptions<ST> = {}
    ) {
        this.storeData = storeData;
        this.services = services;
        this.entity = entity ?? createViewModel(storeData);
        this.isCustomEntity = entity !== undefined;
        this.isEdit = initiallyEditing ?? false;
        this.hasForm = hasForm ?? true;
        this.className = className ?? "";
        this.i18nPrefix = i18nPrefix ?? "focus";
        this.actionsErrorDisplay = errorDisplay ?? (this.isEdit ? "after-focus" : "always");
        this.errorDisplay = this.actionsErrorDisplay;

        // On met en place la réaction de chargement.
        if (services.getLoadParams) {
            this.loadDisposer = reaction(services.getLoadParams, () => this.load(), {equals: comparer.structural});
        }
    }

    /** Change le mode du formulaire. */
    @action
    toggleEdit = (isEdit: boolean) => {
        this.isEdit = isEdit;
        if (this.actionsErrorDisplay === "after-focus") {
            this.errorDisplay = "after-focus";
        }
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
                        this.storeData.replaceNodes(data ?? []);
                    } else {
                        this.storeData.replace(data ?? {});
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
        if (this.actionsErrorDisplay === "after-focus") {
            this.errorDisplay = "after-focus";
        }
        messageStore.addSuccessMessage(`${this.i18nPrefix}.detail.saved`);
    }

    /**
     * Valide les différents champs du formulaire.
     *
     * Surcharger la méthode pour ajouter une validation personnalisée.
     */
    validate() {
        // On force en premier lieu l'affichage des erreurs sur tous les champs.
        if (this.actionsErrorDisplay === "after-focus") {
            this.errorDisplay = "always";
        }

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
        DT extends DomainFieldType,
        T extends DomainType<DT>,
        DCDProps extends BaseDisplayProps<DT>,
        LCDProps extends BaseLabelProps,
        DCProps extends BaseDisplayProps<DT> = DCDProps,
        LCProps extends BaseLabelProps = LCDProps
    >(
        field: EntityField<FieldEntry<DT, T, any, any, any, DCDProps, LCDProps>>,
        options: FieldOptions<FieldEntry<DT, T, any, any, any, DCDProps, LCDProps>> &
            Omit<Metadata<DT, T, any, any, any, DCProps, LCProps>, "fieldProps"> = {}
    ): ReactElement {
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
        DT extends DomainFieldType,
        T extends DomainType<DT>,
        ACDProps extends BaseAutocompleteProps<DT>,
        DCDProps extends BaseDisplayProps<DT>,
        LCDProps extends BaseLabelProps,
        ACProps extends BaseAutocompleteProps<DT> = ACDProps,
        DCProps extends BaseDisplayProps<DT> = DCDProps,
        LCProps extends BaseLabelProps = LCDProps
    >(
        field: EntityField<FieldEntry<DT, T, any, any, ACDProps, DCDProps, LCDProps>>,
        options: FieldOptions<FieldEntry<DT, T, any, any, ACDProps, DCDProps, LCDProps>> &
            Omit<Metadata<DT, T, any, any, ACProps, DCProps, LCProps>, "fieldProps"> & {
                error?: string;
                isEdit?: boolean;
                name?: string;
                keyResolver?: (key: T) => Promise<string | undefined>;
                querySearcher?: (text: string) => Promise<{key: string; label: string}[]>;
            } = {}
    ): ReactElement {
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
        DT extends DomainFieldType,
        T extends DomainType<DT>,
        ICDProps extends BaseInputProps<DT>,
        DCDProps extends BaseDisplayProps<DT>,
        LCDProps extends BaseLabelProps,
        ICProps extends BaseInputProps<DT> = ICDProps,
        DCProps extends BaseDisplayProps<DT> = DCDProps,
        LCProps extends BaseLabelProps = LCDProps
    >(
        field: EntityField<FieldEntry<DT, T, ICDProps, any, any, DCDProps, LCDProps>>,
        options: FieldOptions<FieldEntry<DT, T, ICDProps, any, any, DCDProps, LCDProps>> &
            Omit<Metadata<DT, T, ICProps, any, any, DCProps, LCProps>, "fieldProps"> & {
                error?: string;
                isEdit?: boolean;
                name?: string;
            } = {}
    ): ReactElement {
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
        DT extends DomainFieldType,
        T extends DomainType<DT>,
        SCDProps extends BaseSelectProps<DT>,
        DCDProps extends BaseDisplayProps<DT>,
        LCDProps extends BaseLabelProps,
        SCProps extends BaseSelectProps<DT> = SCDProps,
        DCProps extends BaseDisplayProps<DT> = DCDProps,
        LCProps extends BaseLabelProps = LCDProps
    >(
        field: EntityField<FieldEntry<DT, T, any, SCDProps, any, DCDProps, LCDProps>>,
        values: ReferenceList,
        options: FieldOptions<FieldEntry<DT, T, any, SCDProps, any, DCDProps, LCDProps>> &
            Omit<Metadata<DT, T, any, SCProps, any, DCProps, LCProps>, "fieldProps"> & {
                error?: string;
                isEdit?: boolean;
                name?: string;
            } = {}
    ): ReactElement {
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
                errorDisplay={this.errorDisplay}
                noForm={!this.hasForm}
                save={() => this.save()}
                theme={{form: this.className}}
            >
                {this.renderContent()}
            </Form>
        );
    }
}
