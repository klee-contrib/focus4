import {autobind} from "core-decorators";
import {action, computed, Lambda, observable, ObservableMap, reaction, runInAction} from "mobx";
import * as PropTypes from "prop-types";
import * as React from "react";
import {v4} from "uuid";

import {DisplayProps, InputProps, LabelProps, PanelProps, SelectProps} from "../components";
import {ReactComponent} from "../config";
import {messageStore} from "../message";
import {classAutorun} from "../util";

import {FieldOptions, ReferenceOptions, RefValues} from "./field";
import {FormNode} from "./form-node";
import {toFlatValues} from "./store";
import {Domain, EntityField, StoreNode} from "./types";

import {displayFor, fieldFor, selectFor, stringFor} from "./field-helpers";

import {form} from "./__style__/auto-form.css";

/** Options additionnelles de l'AutoForm. */
export interface AutoFormOptions {

    /** Pour ajouter une classe particulière sur le formulaire. */
    className?: string;

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
@autobind
export abstract class AutoForm<P = {}> extends React.Component<P, void> {

    /** Map de tous les formulaires actuellement affichés avec leur état en édition */
    static readonly editingMap: ObservableMap<boolean> = observable.map<boolean>();

    /** Précise si au moins un formulaire de l'application est en édition. */
    @computed
    static get isOneEdit() {
        return AutoForm.editingMap.values()
            .some(x => x);
    }

    // On ne peut pas injecter le contexte dans le form (héritage...) donc on va le chercher directement pour le style CSS.
    static contextTypes = {theme: PropTypes.object};
    context!: {theme: {[key: string]: {[key: string]: any}}};

    /** Identifiant unique du formulaire. */
    formId = v4();

    /** Etat courant du formulaire, à définir à partir de `makeFormNode`. Sera réinitialisé à chaque modification du `sourceNode`. */
    abstract entity: StoreNode & FormNode;

    /** Services. */
    services!: ServiceConfig<any, any>;

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
    formInit(services: ServiceConfig<any, any>, {className, hasForm, i18nPrefix, initiallyEditing}: AutoFormOptions = {}) {
        this.services = services;
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
        this.entity.subscribe();
        this.load();
    }

    componentWillUnmount() {
        AutoForm.editingMap.delete(this.formId);
        this.entity.unsubscribe();
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
                this.entity.sourceNode.clear();
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
                this.entity.sourceNode.clear();
                const data = await load(...params);
                runInAction(() => {
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
        // On ne sauvegarde que si la validation est en succès.
        if (!this.entity.form || this.entity.form.isValid) {
            this.isLoading = true;
            try {
                const data = await this.services.save(toFlatValues(this.entity));
                runInAction(() => {
                    this.isLoading = false;
                    this.isEdit = false;
                    this.entity.sourceNode.set(data); // En sauvegardant le retour du serveur dans le noeud de store, l'état du formulaire va se réinitialiser.
                });
                this.onFormSaved();
            } catch (e) {
                this.isLoading = false;
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

    /** Récupère les props à fournir à un Panel pour relier ses boutons au formulaire. */
    getPanelProps(): PanelProps {
        return {
            editing: this.isEdit,
            loading: this.isLoading,
            save: this.hasForm ? undefined : this.save,
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
    displayFor<
        T,
        DCProps = DisplayProps,
        LCProps = LabelProps
    >(
        field: EntityField<T, Domain<any, DCProps, LCProps>>,
        options: Partial<FieldOptions<T, any, DCProps, LCProps>> = {}
    ) {
        return displayFor(field, options);
    }

    /**
     * Crée un champ standard.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    fieldFor<
        T,
        ICProps = InputProps,
        DCProps = DisplayProps,
        LCProps = LabelProps
    >(
        field: EntityField<T, Domain<ICProps, DCProps, LCProps>>,
        options: Partial<FieldOptions<T, ICProps, DCProps, LCProps>> = {}
    ) {
        return fieldFor(field, this.setFieldOptions(options));
    }

    /**
     * Crée un champ avec résolution de référence.
     * @param field La définition de champ.
     * @param listName Le nom de la liste de référence.
     * @param options Les options du champ.
     */
    selectFor<
        T,
        ICProps = Partial<SelectProps>,
        DCProps = DisplayProps,
        LCProps = LabelProps,
        R extends RefValues<T, ValueKey, LabelKey> = any,
        ValueKey extends string = "code",
        LabelKey extends string = "label"
    >(
        field: EntityField<T, Domain<any, DCProps, LCProps>>,
        values: R[],
        options: Partial<FieldOptions<T, ICProps, DCProps, LCProps, R, ValueKey, LabelKey>> & {
            SelectComponent?: ReactComponent<ICProps>
        } = {}
    ) {
        return selectFor(field, values as any, this.setFieldOptions(options as any));
    }

    /**
     * Récupère le texte correspondant à un champ.
     * @param field La définition de champ.
     * @param options Les options du champ.
     */
    stringFor<
        T,
        R extends RefValues<T, ValueKey, LabelKey>,
        ValueKey extends string = "code",
        LabelKey extends string = "label"
    >(
        field: EntityField<T>,
        options: ReferenceOptions<T, R, ValueKey, LabelKey> = {}
    ) {
        return stringFor(field, options);
    }

    /**
     * Ajoute les options aux champs pour les lier au formulaire (`ref`, `error`, `isEdit`).
     * @param field La définition du champ.
     * @param options Les options du champ.
     */
    private setFieldOptions<T, IC, DC, LC>(options: Partial<FieldOptions<T, IC, DC, LC>>) {
        if (options.isEdit === undefined) {
            options.isEdit = this.isEdit;
        }
        return options;
    }
}

export default AutoForm;
