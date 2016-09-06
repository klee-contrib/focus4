import {autobind} from "core-decorators";
import * as React from "react";

import * as defaults from "../defaults";
import {EntityField} from "../entity";
import {CLProps} from "../list/memory-list";

import {Component} from "./component";
import {textFor} from "./field-helpers";

export {CLProps};

/** Classe de base pour des composants de ligne Focus (à utiliser avec `listFor`). */
export abstract class ComponentLine<P, E> extends Component<P & CLProps<E>> {

    readonly lineType: "selection" | "table" | "timeline";
    private dateField: EntityField | undefined;
    private isSelectionnable: boolean;

    /**
     * Crée une nouvelle instance de ComponentLine.
     * @param props Les props du composant.
     * @param entity L'entité du composant.
     * @param lineType Le type de ligne.
     * @param dateField Pour une ligne de type `timeline`, le nom du champ date (`fields['date']` sera utilisé si non spécifié).
     */
    constructor(props: P & CLProps<E>, lineType: "selection" | "table" | "timeline" = "table", dateField?: EntityField) {
        super(props);
        this.lineType = props.lineType || lineType;
        this.dateField = dateField;

        // TODO
        /*if (lineType === "timeline" && !dateField) {
            this.dateField = entity.fields["date"];
        }*/
    }

    componentWillMount() {
        const {isSelected, isSelection, onSelection, data} = this.props;
        if (this.lineType === "selection" && isSelection) {
            this.isSelectionnable = this.selectionnableInitializer(data);
            if (onSelection) {
                onSelection(data, this.selectedInitializer(data) || isSelected, true);
            }
        }
    }

    /** Définit si la ligne est sélectionnée à l'initialisation. */
    selectedInitializer(data?: E) {
        return false;
    }

    /** Définit si la ligne est sélectionnable à l'initialisation. */
    selectionnableInitializer(data?: E) {
        return true;
    }

    /** Récupère la valeur de la ligne. */
    @autobind
    getValue() {
        const {data: item, isSelected} = this.props;
        return {item, isSelected};
    }

    /** Retourne la liste des actions disponibles dans la ligne (après la prop `operationList`). */
    @autobind
    renderLineActions() {
        const {ContextualActions} = defaults;
        if (!ContextualActions) {
            throw new Error("Le composant ContextualActions n'a pas été défini. Utiliser 'autofocus/defaults' pour enregistrer les défauts.");
        }

        const {data, operationList} = this.props;
        const isSelection = this.lineType === "selection";
        if (operationList && operationList.length > 0) {
            return (
                <div className={isSelection ? "sl-actions" : ""} data-focus={isSelection ? "" : "table-line-actions"}>
                    <ContextualActions
                        operationList={operationList}
                        operationParam={data}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    @autobind
    handleSelectionClick() {
        const isSelected = !this.props.isSelected;
        const {data, onSelection} = this.props;
        if (onSelection && data) {
            onSelection(data, isSelected);
        }
    }

    @autobind
    private renderSelectionBox() {
        const {Checkbox} = defaults;
        if (!Checkbox) {
            throw new Error("Le composant Checkbox n'a pas été défini. Utiliser 'autofocus/defaults' pour enregistrer les défauts.");
        }

        const {isSelected} = this.props;
        if (this.isSelectionnable) {
            const selectionClass = isSelected ? "selected" : "no-selection";
            return (
                <div className={`sl-selection ${selectionClass}`}>
                    <Checkbox onChange={this.handleSelectionClick} value={isSelected} />
                </div>
            );
        }
        return null;
    }

    @autobind
    private selection(content: React.ReactElement<any>) {
        return (
            <li data-focus="sl-line">
                {this.renderSelectionBox()}
                <div className="sl-content">
                    {content}
                </div>
                {this.renderLineActions()}
            </li>
        );
    }

    @autobind
    private timeline(content: React.ReactElement<any>) {
        return (
            <li>
                <div className="timeline-date">{this.dateField ? textFor(this.dateField) : null}</div>
                <div className="timeline-badge"></div>
                <div className="timeline-panel">
                    {content}
                </div>
            </li>
        );
    }

    abstract renderLineContent(): React.ReactElement<any>;
    render() {
        const render = this.lineType === "selection" ? this.selection : this.lineType === "timeline" ? this.timeline : (x: React.ReactElement<any>) => x;
        return render(this.renderLineContent());
    }
}
