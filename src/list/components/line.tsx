import {autobind} from "core-decorators";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {IconButton} from "react-toolbox/lib/button";

import {getIcon} from "../../components";
import {ReactComponent} from "../../config";
import {EntityField, stringFor} from "../../entity";

import {MiniListStore} from "../store-base";
import ContextualActions, {LineOperationListItem} from "./contextual-actions";

import * as styles from "./__style__/line.css";

export type LineStyle = Partial<typeof styles>;

/** Props de base d'un composant de lingne. */
export interface LineProps<T> {
    /** Elément de la liste. */
    data: T;
    /** Handler pour ouvrir le détail. */
    openDetail?: () => void;
}

/** Props du wrapper autour des lignes de liste. */
export interface LineWrapperProps<T> {
    /** L'élément de liste. */
    data: T;
    /** Le sélecteur pour le champ date, pour une ligne timeline. */
    dateSelector?: (data: T) => EntityField<string>;
    /** Affiche ou non la checkbox de sélection. */
    hasSelection?: boolean;
    /** Préfixe i18n. Par défaut: "focus". */
    i18nPrefix?: string;
    /** Détermine si la ligne est sélectionnable. Par défaut () => true. */
    isSelectionnable?: (data: T) => boolean;
    /** Composant de ligne (ligne, mosaïque, row ou timeline à priori). */
    LineComponent: ReactComponent<LineProps<T>>;
    /** Configuration de la mosaïque (si applicable). */
    mosaic?: {width: number, height: number};
    /** Handler pour ouvrir (et fermer) le détail. */
    openDetail?: () => void;
    /** Actions de ligne. */
    operationList?: (data: T) => LineOperationListItem<T>[];
    /** Store de liste associé à la ligne. */
    store?: MiniListStore<T>;
    /** CSS. */
    theme?: LineStyle;
    /** Type spécial de ligne. */
    type?: "table" | "timeline";
}

/** Wrapper de ligne dans une liste. */
@autobind
@observer
export class LineWrapper<T> extends React.Component<LineWrapperProps<T>, void> {

    /** Etat de sélection de l'item courant. */
    @computed
    get isSelected() {
        const {store} = this.props;
        return store && store.selectedItems.has(this.props.data) || false;
    }

    /** Handler de clic sur la case de sélection. */
    onSelection() {
        const {store} = this.props;
        if (store) {
            store.toggle(this.props.data);
        }
    }

    render() {
        const {LineComponent, openDetail, data, dateSelector, hasSelection, i18nPrefix = "focus", mosaic, isSelectionnable = () => true, theme, operationList, type, store} = this.props;
        switch (type) {
            case "table": // Pour un tableau, on laisse l'utiliseur spécifier ses lignes de tableau directement.
                return <LineComponent data={data} />;
            case "timeline": // Pour une timeline, on wrappe simplement la ligne dans le conteneur de timeline qui affiche la date et la décoration de timeline.
                return (
                    <li>
                        <div className={theme!.timelineDate}>{stringFor(dateSelector!(data))}</div>
                        <div className={theme!.timelineBadge}></div>
                        <div className={theme!.timelinePanel}>
                            <LineComponent data={data} />
                        </div>
                    </li>
                );
            default: // Pour une liste, on ajoute éventuellement la case à cocher et les actions de ligne.
                const opList = operationList && operationList(data);
                return (
                    <li
                        className={`${mosaic ? theme!.mosaic : theme!.line} ${this.isSelected ? theme!.selected : ""}`}
                        style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}
                    >
                        {hasSelection && isSelectionnable(data) && store ?
                            <IconButton
                                className={`${theme!.checkbox} ${store.selectedItems.size ? theme!.isSelection : ""}`}
                                icon={getIcon(`${i18nPrefix}.icons.line.${this.isSelected ? "" : "un"}selected`)}
                                onClick={this.onSelection}
                                primary={this.isSelected}
                                theme={{toggle: theme!.toggle, icon: theme!.checkboxIcon}}
                            />
                        : null}
                        <LineComponent data={data} openDetail={openDetail} />
                        {opList && opList.length > 0 ?
                            <div
                                className={theme!.actions}
                                style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}
                            >
                                <ContextualActions
                                    isMosaic={!!mosaic}
                                    operationList={opList}
                                    operationParam={data}
                                />
                            </div>
                        : null}
                    </li>
                );
        }
    }
}

export default themr("line", styles)(LineWrapper);
