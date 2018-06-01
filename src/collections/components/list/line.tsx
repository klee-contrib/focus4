import {action, computed, IObservableArray, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {ConnectDragPreview, ConnectDragSource} from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";
import {findDOMNode} from "react-dom";
import {Motion, spring} from "react-motion";
import {IconButton} from "react-toolbox/lib/button";

import {getIcon} from "../../../components";
import {EntityField, FieldEntry, stringFor} from "../../../entity";
import {themr} from "../../../theme";

import {ListStoreBase} from "../../store";
import {ContextualActions, OperationListItem} from "./contextual-actions";

import * as styles from "./__style__/line.css";
export type LineStyle = Partial<typeof styles>;
const Theme = themr("line", styles);

/** Props de base d'un composant de lingne. */
export interface LineProps<T> {
    /** Elément de la liste. */
    data: T;
    /** Handler pour ouvrir le détail. */
    openDetail?: () => void;
}

/** Props du wrapper autour des lignes de liste. */
export interface LineWrapperProps<T> {
    /** Connecteur vers la source de DnD. */
    connectDragSource?: ConnectDragSource;
    /** Connecteur vers la preview de DnD. */
    connectDragPreview?: ConnectDragPreview;
    /** L'élément de liste. */
    data: T;
    /** Le sélecteur pour le champ date, pour une ligne timeline. */
    dateSelector?: (data: T) => EntityField<FieldEntry<string>>;
    /** Désactive l'animation de drag and drop. */
    disableDragAnimation?: boolean;
    /** Les items en cours de drag dans la liste. */
    draggedItems?: IObservableArray<T>;
    /** Affiche ou non la checkbox de sélection. */
    hasSelection?: boolean;
    /** Préfixe i18n. Par défaut: "focus". */
    i18nPrefix?: string;
    /** Composant de ligne (ligne, mosaïque, row ou timeline à priori). */
    LineComponent: React.ComponentType<LineProps<T>>;
    /** Configuration de la mosaïque (si applicable). */
    mosaic?: {width: number; height: number};
    /** Handler pour ouvrir (et fermer) le détail. */
    openDetail?: () => void;
    /** Actions de ligne. */
    operationList?: (data: T) => OperationListItem<T>[];
    /** Store de liste associé à la ligne. */
    store?: ListStoreBase<T>;
    /** Style passé par la liste pour masquer l'élement en cours de drag. */
    style?: {opacity?: number};
    /** CSS. */
    theme?: LineStyle;
    /** Type spécial de ligne. */
    type?: "table" | "timeline";
}

/** Wrapper de ligne dans une liste. */
@observer
export class LineWrapper<T> extends React.Component<LineWrapperProps<T>> {
    /** Hauteur de la ligne (en mode ligne, en mosaïque elle est fixée.) */
    @observable private height?: number;
    /** Force l'affichage des actions. */
    @observable private forceActionDisplay = false;

    componentDidMount() {
        this.updateHeight();

        // Permet de masquer la preview par défaut de drag and drop HTML5.
        if (this.props.connectDragPreview) {
            this.props.connectDragPreview(getEmptyImage());
        }
    }

    componentWillReceiveProps({data}: LineWrapperProps<T>) {
        // On reset la hauteur si on change de data.
        if (data !== this.props.data) {
            this.height = undefined;
        }
    }

    componentDidUpdate({data}: LineWrapperProps<T>) {
        if (data !== this.props.data) {
            // Puis on la recalcule.
            this.updateHeight();
        }
    }

    /** Met à jour la hauteur de la ligne. */
    updateHeight() {
        const node = findDOMNode(this) as HTMLElement;
        if (node) {
            this.height = node.clientHeight;
        }
    }

    /** Etat de sélection de l'item courant. */
    @computed
    get isSelected() {
        const {store} = this.props;
        return (store && store.selectedItems.has(this.props.data)) || false;
    }

    /** Handler de clic sur la case de sélection. */
    @action.bound
    onSelection() {
        const {store} = this.props;
        if (store) {
            store.toggle(this.props.data);
        }
    }

    @action.bound
    setForceActionDisplay() {
        this.forceActionDisplay = true;
    }

    @action.bound
    unsetForceActionDisplay() {
        this.forceActionDisplay = false;
    }

    render() {
        const {
            draggedItems,
            disableDragAnimation,
            style,
            connectDragSource,
            LineComponent,
            openDetail,
            data,
            dateSelector,
            hasSelection,
            i18nPrefix = "focus",
            mosaic,
            operationList,
            type,
            store
        } = this.props;
        switch (type) {
            case "table": // Pour un tableau, on laisse l'utiliseur spécifier ses lignes de tableau directement.
                return <LineComponent data={data} />;
            case "timeline": // Pour une timeline, on wrappe simplement la ligne dans le conteneur de timeline qui affiche la date et la décoration de timeline.
                return (
                    <Theme theme={this.props.theme}>
                        {theme => (
                            <li>
                                <div className={theme.timelineDate}>{stringFor(dateSelector!(data))}</div>
                                <div className={theme.timelineBadge} />
                                <div className={theme.timelinePanel}>
                                    <LineComponent data={data} />
                                </div>
                            </li>
                        )}
                    </Theme>
                );
            default:
                // Pour une liste, on ajoute éventuellement la case à cocher et les actions de ligne.
                const opList = operationList && operationList(data);

                // On construit une fonction de rendu à part parce qu'on ne va pas toujours wrapper le résultat dans le Motion.
                const lineContent = ({height, width}: {height?: number; width?: number}) => (
                    // On a besoin de rewrapper le contenu dans un <Observer> parce que sinon on perd le contexte MobX dans la Motion.
                    <Theme theme={this.props.theme}>
                        {
                            ((theme: LineStyle) =>
                                // Si pas de drag and drop, la fonction est l'identité.
                                (connectDragSource || (x => x))(
                                    <li
                                        className={`${mosaic ? theme.mosaic : theme.line} ${
                                            this.isSelected ? theme.selected : ""
                                        }`}
                                        style={{
                                            width: mosaic ? width || mosaic.width : undefined,
                                            height: mosaic ? height || mosaic.height : height,
                                            opacity: style && style.opacity
                                        }}
                                    >
                                        <LineComponent data={data} openDetail={openDetail} />
                                        {hasSelection && store && store.isItemSelectionnable(data) ? (
                                            <IconButton
                                                className={`${theme.checkbox} ${
                                                    store.selectedItems.size ? theme.forceDisplay : ""
                                                }`}
                                                icon={getIcon(
                                                    `${i18nPrefix}.icons.line.${this.isSelected ? "" : "un"}selected`
                                                )}
                                                onClick={this.onSelection}
                                                primary={this.isSelected}
                                                theme={{toggle: theme.toggle, icon: theme.checkboxIcon}}
                                            />
                                        ) : null}
                                        {opList && opList.length > 0 ? (
                                            <div
                                                className={`${theme.actions} ${
                                                    this.forceActionDisplay ? theme.forceDisplay : ""
                                                }`}
                                                style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}
                                            >
                                                <ContextualActions
                                                    isMosaic={!!mosaic}
                                                    operationList={opList}
                                                    data={data}
                                                    onClickMenu={this.setForceActionDisplay}
                                                    onHideMenu={this.unsetForceActionDisplay}
                                                />
                                            </div>
                                        ) : null}
                                    </li>
                                )) as any
                        }
                    </Theme>
                );

                // On ne wrappe la ligne dans le Motion que si la hauteur est définie pour
                // - ne pas avoir une animation de départ d'une valeur quelconque jusqu'à la bonne valeur.
                // - ne pas avoir d'animation lorsque l'élément affiché change, comme par exemple lorsqu'on supprime un élément.
                if (this.height && draggedItems && !disableDragAnimation) {
                    return (
                        <Motion
                            defaultStyle={{
                                height: (mosaic && mosaic.height) || this.height,
                                width: (mosaic && mosaic.width) || 0
                            }}
                            style={{
                                width: (mosaic && spring(style && style.opacity ? mosaic.width : 0)) || 0,
                                height: spring(style && !style.opacity ? 0 : mosaic ? mosaic.height : this.height)
                            }}
                        >
                            {lineContent}
                        </Motion>
                    );
                } else {
                    // Sinon on ne passe pas de style et ça restera à undefined.
                    return lineContent({});
                }
        }
    }
}
