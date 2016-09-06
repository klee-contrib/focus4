/*
    TODO : Refactor des trois types en :
    - table => rien (plus besoin)
    - timeline => une fonction qui wrap le render pour ajouter la timeline
    - selection => cette classe au moins, à voir si on peut faire comme la timeline sans que ça soit l'horreur (je pense que oui)
*/

import {autobind} from "core-decorators";
import * as React from "react";

import * as defaults from "../defaults";
import {EntityField} from "../entity";
import {ALProps} from "../list/memory-list";

import {textFor} from "./field-helpers";

export {ALProps};

/** Classe de base pour des composants de ligne Focus (à utiliser avec `listFor`). */
export abstract class AutoLine<P, E> extends React.Component<P & ALProps<E>, {}> {

    readonly lineType: "selection" | "table" | "timeline";
    protected date: EntityField<string> | undefined;
    private isSelectionnable: boolean;

    /**
     * Crée une nouvelle instance de ComponentLine.
     * @param props Les props du composant.
     * @param lineType Le type de ligne.
     */
    constructor(props: P & ALProps<E>, lineType: "selection" | "table" | "timeline" = "table") {
        super(props);
        this.lineType = props.lineType || lineType;
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
                <div className="timeline-date">{this.date ? textFor(this.date) : null}</div>
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
