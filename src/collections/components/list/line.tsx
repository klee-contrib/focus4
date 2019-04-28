import {action, computed, IObservableArray, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {ConnectDragPreview, ConnectDragSource} from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";
import posed from "react-pose";
import {IconButton} from "react-toolbox/lib/button";

import {springPose} from "../../../animation";
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
    /** Handler pour ouvrir et fermer le détail. */
    toggleDetail?: (callbacks?: {onOpen?: () => void; onClose?: () => void}) => void;
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
    /** Ref vers l'élement DOM racine de la ligne. */
    domRef?: (element: HTMLElement | null) => void;
    /** Désactive l'animation de drag and drop. */
    disableDragAnimation?: boolean;
    /** Les items en cours de drag dans la liste. */
    draggedItems?: IObservableArray<T>;
    /** Affiche ou non la checkbox de sélection. */
    hasSelection?: boolean;
    /** Préfixe i18n. Par défaut: "focus". */
    i18nPrefix?: string;
    /** Composant de ligne (ligne, mosaïque, row ou timeline à priori). */
    LineComponent: React.ComponentType<LineProps<T> & {ref?: React.Ref<any>}>;
    /** Configuration de la mosaïque (si applicable). */
    mosaic?: {width: number; height: number};
    /** Fonction passée par react-pose qu'il faudra appeler au willUnmount pour qu'il retire l'élément du DOM. */
    onPoseComplete?: (pose: string) => void;
    /** Actions de ligne. */
    operationList?: (data: T) => OperationListItem<T>[];
    /** Store de liste associé à la ligne. */
    store?: ListStoreBase<T>;
    /** Handler pour ouvrir et fermer le détail. */
    toggleDetail?: (callbacks?: {onOpen?: () => void; onClose?: () => void}) => void;
    /** CSS. */
    theme?: LineStyle;
    /** Type spécial de ligne. */
    type?: "timeline";
}

/** Wrapper de ligne dans une liste. */
@observer
export class LineWrapper<T> extends React.Component<LineWrapperProps<T>> {
    /** Force l'affichage des actions. */
    @observable protected forceActionDisplay = false;

    componentDidMount() {
        // Permet de masquer la preview par défaut de drag and drop HTML5.
        if (this.props.connectDragPreview) {
            this.props.connectDragPreview(getEmptyImage() as any);
        }
    }

    componentWillReceiveProps({onPoseComplete}: LineWrapperProps<T>) {
        // Si on n'appelle pas ça, vu que la ligne est posée dans un contexte de transition react-pose à cause du détail,
        // la ligne ne sera jamais retirée du DOM.
        if (onPoseComplete) {
            onPoseComplete("exit");
        }
    }

    /** Précise si la ligne est sélectionnable. */
    @computed
    get isSelectable() {
        const {data, hasSelection, store} = this.props;
        return (hasSelection && store && store.isItemSelectionnable(data)) || false;
    }

    /** Précise si la checkbox doit être affichée. */
    @computed
    get isCheckboxDisplayed() {
        const {store} = this.props;
        return (store && !!store.selectedItems.size) || false;
    }

    /** Précise si la ligne est sélectionnée.. */
    @computed
    get isSelected() {
        const {data, store} = this.props;
        return (store && store.selectedItems.has(data)) || false;
    }

    /** Précise si la ligne est en train d'être "draggée". */
    @computed
    get isDragged() {
        const {data, draggedItems} = this.props;
        return (draggedItems && draggedItems.find(i => i === data)) || false;
    }

    /** Actions sur la ligne. */
    @computed.struct
    get operationList() {
        const {data, operationList} = this.props;
        const opList = operationList && operationList(data);
        return opList && opList.length ? opList : undefined;
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
            connectDragSource,
            data,
            dateSelector,
            disableDragAnimation,
            domRef,
            i18nPrefix = "focus",
            LineComponent,
            mosaic,
            toggleDetail,
            type
        } = this.props;

        switch (type) {
            case "timeline":
                // Pour une timeline, on wrappe simplement la ligne dans le conteneur de timeline qui affiche la date et la décoration de timeline.
                return (
                    <Theme theme={this.props.theme}>
                        {theme => (
                            <li ref={domRef}>
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
                // Pour une liste, on ajoute la case de sélection et les actions de ligne, si demandées.
                return (
                    <Theme theme={this.props.theme}>
                        {(theme: LineStyle) => (
                            <DraggableLi
                                className={`${mosaic ? theme.mosaic : theme.line} ${
                                    this.isSelected ? theme.selected : ""
                                }`}
                                connectDragSource={connectDragSource}
                                ref={domRef}
                                pose={this.isDragged && !disableDragAnimation ? "dragging" : "idle"}
                                width={mosaic && mosaic.width}
                                height={mosaic && mosaic.height}
                            >
                                <LineComponent data={data} toggleDetail={toggleDetail} />
                                {this.isSelectable ? (
                                    <IconButton
                                        className={`${theme.checkbox} ${
                                            this.isCheckboxDisplayed ? theme.forceDisplay : ""
                                        }`}
                                        icon={getIcon(
                                            `${i18nPrefix}.icons.line.${this.isSelected ? "" : "un"}selected`
                                        )}
                                        onClick={this.onSelection}
                                        primary={this.isSelected}
                                        theme={{toggle: theme.toggle, icon: theme.checkboxIcon}}
                                    />
                                ) : null}
                                {this.operationList ? (
                                    <div
                                        className={`${theme.actions} ${
                                            this.forceActionDisplay ? theme.forceDisplay : ""
                                        }`}
                                        style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}
                                    >
                                        <ContextualActions
                                            isMosaic={!!mosaic}
                                            operationList={this.operationList}
                                            data={data}
                                            onClickMenu={this.setForceActionDisplay}
                                            onHideMenu={this.unsetForceActionDisplay}
                                        />
                                    </div>
                                ) : null}
                            </DraggableLi>
                        )}
                    </Theme>
                );
        }
    }
}

/** On construit un <li> "draggable" qui est la composition de react-pose (animation) et react-dnd */
const DraggableLi = posed(
    // react-pose et react-dnd ont tous les deux besoin de la ref sur le <li>, et le premier est le seul qui supporte la forwardRef.
    // Néanmoins, react-dnd fait quand même des choses bizarres avec et ça fait des warnings (qui ont l'air inoffensifs).
    React.forwardRef(({connectDragSource = (x => x) as ConnectDragSource, ...props}: any, ref) =>
        connectDragSource(<li ref={ref} {...props} />)
    )
)({
    props: {width: undefined, height: undefined},
    dragging: {
        applyAtStart: {opacity: 0},
        width: ({width}: {width?: number}) => (width ? 0 : undefined),
        height: 0,
        ...springPose
    },
    idle: {
        applyAtStart: {opacity: 1},
        width: ({width}: {width?: number}) => width || "100%",
        height: ({height}: {height?: number}) => height || "auto",
        ...springPose
    }
});
