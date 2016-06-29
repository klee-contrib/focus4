import * as React from "react";
import {ComponentWithEntity} from "./component-with-entity";
import {autobind} from "core-decorators";
import {Entity, EntityField} from "../definition";
import * as defaults from "./defaults";

/**
 * Props propre à ComponentLine.
 */
export interface CLProps<E> {
    data?: E;
    isSelected?: boolean;
    lineType?: 'selection' | 'table' | 'timeline';
    onSelection?: (data: E, isSelected: boolean) => void;
    operationList?: {
        action: (data: {}) => void,
        style: {shape: 'icon' | 'flat' | 'raised'},
        icon: string,
        priority: number
    }[];
    reference?: {[key: string]: {}[]};
}

/**
 * State propre à ComponentLine.
 */
export interface CLState {
    isSelected?: boolean;
}

/**
 * Classe de base pour des composants de ligne Focus (à utiliser avec `listFor`).
 */
export abstract class ComponentLine<P, S, E> extends ComponentWithEntity<P & CLProps<E>, S & CLState, E> {

    private dateField: EntityField | undefined;
    private lineType: 'selection' | 'table' | 'timeline';
    private isSelectionnable: boolean;

    /**
     * Crée une nouvelle instance de ComponentLine.
     * @param props Les props du composant.
     * @param entity L'entité du composant.
     * @param lineType Le type de ligne.
     * @param dateField Pour une ligne de type `timeline`, le nom du champ date (`fields['date']` sera utilisé si non spécifié).
     */
    constructor(props: P & CLProps<E>, entity: Entity<E>, lineType: 'selection' | 'table' | 'timeline' = "table", dateField?: EntityField) {
        super(props, entity);
        this.state.entity = props.data;
        this.lineType = props.lineType || lineType;

        if (lineType === "selection" && props.data) {
            this.state.isSelected = props.isSelected !== undefined ? props.isSelected : this.selectedInitializer(props.data);
        }

        this.dateField = dateField || entity.fields["date"];
    }

    componentWillMount() {
        super.componentWillMount();

        if (this.lineType === "selection" && this.props.data) {
            this.isSelectionnable = this.selectionnableInitializer(this.props.data);
        }
    }

    componentWillReceiveProps({data, isSelected}: P & CLProps<E>) {
        this.setState({entity: data} as any);

        if (this.lineType === "selection") {
            if (_.isEqual(data, this.props.data)) {
                if (isSelected !== undefined) {
                    this.setState({isSelected} as any);
                }
            } else {
                this.setState({isSelected: false} as any);
            }
        }
    }

    /** Définit si la ligne est sélectionnée à l'initialisation. */
    selectedInitializer(data: E) {
        return false;
    }

    /** Définit si la ligne est sélectionnable à l'initialisation. */
    selectionnableInitializer(data: E) {
        return true;
    }

    /** Récupère la valeur de la ligne. */
    @autobind
    getValue() {
        const {data: item} = this.props;
        const {isSelected} = this.state;
        return {item, isSelected};
    }

    /** Retourne la liste des actions disponibles dans la ligne (après la prop `operationList`). */
    @autobind
    renderLineActions() {
        const {ContextualActions} = defaults;
        if (!ContextualActions) {
            throw new Error("Le composant ContextualActions n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts.");
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
    private handleSelectionClick() {
        const isSelected = !this.state.isSelected;
        const {data, onSelection} = this.props;
        this.setState({isSelected} as any);
        if (onSelection && data) {
            onSelection(data, isSelected);
        }
    }

    @autobind
    private renderSelectionBox() {
        const {Checkbox} = defaults;
        if (!Checkbox) {
            throw new Error("Le composant Checkbox n'a pas été défini. Utiliser 'autofocus/component/defaults' pour enregistrer les défauts.");
        }

        const {isSelected} = this.state;
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
                <div className="timeline-date">{this.dateField ? this.textFor(this.dateField) : null}</div>
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
