import {autobind} from "core-decorators";
import {isFunction, isEmpty} from "lodash";
import * as React from "react";

import {applicationStore} from "..";
import * as defaults from "../defaults";
import {Entity} from "../definition";
import CoreStore from "../store";

import {ComponentWithEntityAndStore} from "./component-with-entity-and-store";

/** Props propre à ComponentWithForm. */
export interface CWFProps {
    hasEdit?: boolean;
    hasDelete?: boolean;
    hasForm?: boolean;
    hasLoad?: boolean;
    isEdit?: boolean;
    style?: {className?: string};
}

/** Config d'actions à fournir à ComponentWithForm. */
export interface ActionConfig<E> {
    [x: string]: any;
    delete?: (...args: any[]) => Promise<void | number | boolean>;
    load: (...args: any[]) => Promise<E>;
    save: (...args: any[]) => Promise<E>;
}

/** Classe de base pour un composant Focus avec un formulaire. */
@autobind
export abstract class ComponentWithForm<P, S, E, TS extends {}> extends ComponentWithEntityAndStore<P & CWFProps, S, E, TS> {
    static defaultProps = {
        hasForm: true,
        hasEdit: true,
        hasDelete: false,
        hasLoad: true,
        isEdit: false
    };

    /** Container d'action pour le formulaire. */
    private _action: ActionConfig<E>;

    /**
     * Crée une nouvelle instance de ComponentWithForm.
     * `storeNodes` n'inclus PAS le noeud de store de l'entité. Par conséquent, l'entité doit avoir le même nom que le noeud du store.
     * @param config La config du composant.
     */
    constructor({props, entity, store, action, storeNodes, restrictOnChangeOnSelf = false, initWithStore = true}: {
        props: P & CWFProps,
        entity: Entity<E>,
        store: CoreStore<TS>,
        action: ActionConfig<E>,
        storeNodes?: TS,
        restrictOnChangeOnSelf?: boolean,
        initWithStore?: boolean
    }) {
        super({props, entity, store, storeNodes, restrictOnChangeOnSelf, initWithStore});
        this._action = action;

        let {isEdit = false} = this.props;
        this.state.isEdit = isEdit;
    }

    get action() {
        return this._action;
    }

    componentWillMount() {
        super.componentWillMount();

        let {hasLoad = true} = this.props;
        if (hasLoad) {
            this.action.load.call(this, this.Id);
        }
    }

    /** Identifiant utilisé pour l'appel à l'action de load. */
    get Id() {
        return this.props["id"];
    }

    /** Vide les erreurs. */
    clearError() {
        for (let r in this.refs) {
            if (this.refs[r] && isFunction((this.refs[r] as any).setError)) {
                (this.refs[r] as any).setError(undefined);
            }
        }
    }

    /** Récupère l'entité dans les différents champs et dans le state. */
    getEntity() {
        let fieldValues: {[key: string]: string} = {};
        let {refs} = this;
        for (let r in refs) {
            if (refs[r] && isFunction((refs[r] as any).getValue)) {
                fieldValues[r] = (refs[r] as any).getValue();
            }
        }
        return Object.assign({}, this.state.entity, fieldValues);
    }

    /**
     * Handler du bouton d'annulation.
     * Repasse le formulaire en consulation et récupère l'état du store.
     */
    onClickCancel() {
        this.clearError();
        this.setState(
            Object.assign(
                {isEdit: !this.state.isEdit},
                this.getStateFromStore()
            ) as any, () => {
            applicationStore.changeMode("consult", "edit");
        });
    }

    /**
     * Handler du bouton de suppression.
     * Appelle l'action de suppression.
     */
    onClickDelete() {
        if (this.action.delete) {
            this.action.delete.call(this, this.getEntity());
        }
    }

    /**
     * Handler du bouton d'édition.
     * Passe le formulaire en édition et vide les erreurs.
     */
    onClickEdit() {
        this.setState({isEdit: !this.state.isEdit} as any, () => {
            applicationStore.changeMode("edit", "consult");
            this.clearError();
        });
    }

    /**
     * Handler du bouton de sauvegarde.
     * Valide l'entité et appelle l'action de sauvegarde.
     */
    onClickSave() {
        this.setState({entity: this.getEntity()} as any);
        if (this.validate()) {
            this.action.save.call(this, this.getEntity());
        }
    }

    /** Retourne les actions du formulaire. */
    renderActions() {
        return this.state.isEdit ? this.renderEditActions() : this.renderConsultActions();
    }

    /** Retoune les actions en consulation du formualaire. */
    renderConsultActions() {
        let {hasEdit = true, hasDelete = false} = this.props;
        return (
            <div>
                {hasEdit && this.ButtonEdit}
                {hasDelete && this.ButtonDelete}
            </div>
        );
    }

    /** Retourne les action en édition du formulaire. */
    renderEditActions() {
        return (
            <span>
                {this.ButtonSave}
                {this.ButtonCancel}
            </span>
        );
    }

    validate() {
        let validationMap: {[key: string]: string} = {};
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

    private get ButtonCancel() {
        const {Button} = defaults;
        if (!Button) { throw new Error("Le composant Button n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts."); }
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

    private get ButtonDelete() {
        const {Button} = defaults;
        if (!Button) { throw new Error("Le composant Button n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts."); }
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

    private get ButtonEdit() {
        const {Button} = defaults;
        if (!Button) { throw new Error("Le composant Button n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts."); }
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

    private get ButtonSave() {
        const {Button} = defaults;
        if (!Button) { throw new Error("Le composant Button n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts."); }
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

    private get ClassName() {
        return `form-horizontal ${this.props.style && this.props.style.className || ""}`;
    }

    private get Mode() {
        return `${this.state.isEdit ? "edit" : "consult"}`;
    }

    private handleSubmitForm(e: React.FormEvent<any>) {
        e.preventDefault();
        if (this.validate()) {
            this.action.save.call(this, this.getEntity());
        }
    }

    abstract renderContent(): JSX.Element;
    render() {
        if (this.props.hasForm) {
            return (
                <form
                    className={this.ClassName}
                    data-loading={this.state.isLoading}
                    data-mode={this.Mode}
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
