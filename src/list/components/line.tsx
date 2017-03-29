import * as React from "react";

import {ContextualActions} from "./contextual-actions";

import * as styles from "./style/line.css";
export type LineStyle = Partial<typeof styles>;

export interface OperationListItem {
    action: (data?: {} | {}[]) => void;
    buttonShape?: "raised" | "fab" | "icon" | "mini-fab" | null;
    label?: string;
    icon?: string;
    iconLibrary?: "material" | "font-awesome" | "font-custom";
    isSecondary?: boolean;
    style?: string | React.CSSProperties;
}

export interface LineProps<T> {
    classNames?: LineStyle;
    data?: T;
    onLineClick?: (data: T) => void;
    operationList?: OperationListItem[];
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
