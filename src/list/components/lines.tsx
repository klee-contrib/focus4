import * as React from "react";

import * as defaults from "../../defaults";
import {EntityField, textFor} from "../../entity";

import {ContextualActions} from "./contextual-actions";

export interface OperationListItem {
    label?: string;
    action: (data?: {}) => void;
    style?: {shape?: "icon" | "flat" | "raised"};
    icon?: string;
    iconLibrary?: string;
    priority?: number;
}

export interface LineProps<T> {
    data?: T;
    onLineClick?: (data: T) => void;
    operationList?: OperationListItem[];
}

export interface LineSelectionProps<T> extends LineProps<T> {
    isSelected?: boolean;
    onSelection?: (data?: T, isSelected?: boolean, isInit?: boolean) => void;
    isSelection?: boolean;
}

/**
 * Retourne les actions contextuelles pour une ligne quelconque.
 * @param {data, operationList} Les données et la liste d'actions de la ligne.
 * @param isSelection Utilise les classes CSS de la ligne de sélection.
 */
export function renderLineActions({data, operationList}: LineProps<any>, isSelection = false) {
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

/**
 * Composant d'ordre supérieur pour construire une ligne de sélection.
 * @param selectedInitializer Définit si la ligne est sélectionnée à l'initialisation.
 * @param selectionnableInitializer Définit si la ligne est sélectionnable à l'initialisation.
 */
export function lineSelection<P extends LineSelectionProps<E>, E>(
    selectedInitializer = (data?: E) => false,
    selectionnableInitializer = (data?: E) => true
): (Component: defaults.ReactComponent<P>) => React.ComponentClass<P> {
    return (Component: defaults.ReactComponent<P>) => class extends React.Component<P, void> {
        private isSelectionnable: boolean;

        componentWillMount() {
            const {isSelected, isSelection, onSelection, data} = this.props;
            if (isSelection) {
                this.isSelectionnable = selectionnableInitializer(data);
                if (onSelection) {
                    onSelection(data, selectedInitializer(data) || isSelected, true);
                }
            }
        }

        /** Récupère la valeur de la ligne. */
        get value() {
            const {data: item, isSelected} = this.props;
            return {item, isSelected};
        }

        handleSelectionClick = () => {
            const isSelected = !this.props.isSelected;
            const {data, onSelection} = this.props;
            if (onSelection && data) {
                onSelection(data, isSelected);
            }
        }

        renderSelectionBox = () => {
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

        render() {
            return (
                <li data-focus="sl-line">
                    {this.renderSelectionBox()}
                    <div className="sl-content">
                        <Component {...this.props} />
                    </div>
                    {renderLineActions(this.props, this.props.isSelection)}
                </li>
            );
        }
    };
}

/**
 * Component d'ordre supérieur pour construire une ligne de timeline.
 * @param dateSelector Un sélecteur pour récupérer le champ data de l'entité.
 */
export function lineTimeline<P extends LineProps<E>, E>(dateSelector: (data: E) => EntityField<string>) {
    return (Component: defaults.ReactComponent<P>) => (props: P) => (
        <li>
            <div className="timeline-date">{textFor(dateSelector(props.data!))}</div>
            <div className="timeline-badge"></div>
            <div className="timeline-panel">
                <Component {...props} />
            </div>
        </li>
    );
}
