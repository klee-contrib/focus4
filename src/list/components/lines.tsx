import * as React from "react";

import Checkbox from "focus-components/input-checkbox";

import {EntityField, textFor} from "../../entity";
import {injectStyle} from "../../theming";

import {ContextualActions} from "./contextual-actions";

import * as styles from "./style/lines.css";
export type LineStyle = typeof styles;

export interface OperationListItem {
    action: (data?: {}) => void;
    buttonShape?: "raised" | "fab" | "icon" | "mini-fab";
    label?: string;
    icon?: string;
    iconLibrary?: "material" | "font-awesome" | "font-custom";
    priority?: number;
    style?: string | React.CSSProperties;
}

export interface LineProps<T> {
    classNames?: LineStyle;
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
export function renderLineActions({classNames, data, operationList}: LineProps<any>, isSelection = false) {
    if (operationList && operationList.length > 0) {
        return (
            <div className={isSelection ? `${styles.actions} ${classNames!.actions || ""}` : undefined}>
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
): (Component: ReactComponent<P>) => React.ComponentClass<P> {
    return (Component: ReactComponent<P>) => injectStyle("line", class extends React.Component<P, void> {
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
            const {isSelected, classNames} = this.props;
            if (this.isSelectionnable) {
                return (
                    <div className={`${styles.checkbox} ${classNames!.checkbox || ""} ${isSelected ? `${styles.selected} ${classNames!.selected || ""}` : `${styles.unselected} ${classNames!.unselected || ""}`}`}>
                        <Checkbox onChange={this.handleSelectionClick} value={isSelected} />
                    </div>
                );
            } else {
                return null;
            }
        }

        render() {
            return (
                <li className={`${styles.selection} ${this.props.classNames!.selection || ""}`}>
                    {this.renderSelectionBox()}
                    <Component {...this.props} />
                    {renderLineActions(this.props, true)}
                </li>
            );
        }
    });
}

/**
 * Component d'ordre supérieur pour construire une ligne de timeline.
 * @param dateSelector Un sélecteur pour récupérer le champ data de l'entité.
 */
export function lineTimeline<P extends LineProps<E>, E>(dateSelector: (data: E) => EntityField<string>) {
    return (Component: ReactComponent<P>) => injectStyle("line", (props: P) => (
        <li>
            <div className={`${styles.timelineDate} ${props.classNames!.timelineDate || ""}`}>{textFor(dateSelector(props.data!))}</div>
            <div className={`${styles.timelineBadge} ${props.classNames!.timelineBadge || ""}`}></div>
            <div className={`${styles.timelinePanel} ${props.classNames!.timelinePanel || ""}`}>
                <Component {...props} />
            </div>
        </li>
    ));
}
