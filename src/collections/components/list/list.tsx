import i18next from "i18next";
import {action, computed, observable} from "mobx";
import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";
import {themr} from "react-css-themr";
import {findDOMNode} from "react-dom";
import {spring, Style, TransitionMotion} from "react-motion";
import {IconButton} from "react-toolbox/lib/button";
import {FontIcon} from "react-toolbox/lib/font_icon";

import {getIcon} from "../../../components";
import {ReactComponent} from "../../../config";
import {classAutorun, classReaction} from "../../../util";

import {ListStoreBase} from "../../store";
import {OperationListItem} from "./contextual-actions";
import {addDragSource} from "./dnd-utils";
import DndDragLayer, {DragLayerStyle} from "./drag-layer";
import LineWrapper, {LineProps, LineWrapperProps} from "./line";
import {ListBase, ListBaseProps} from "./list-base";

import * as styles from "./__style__/list.css";

/** Props de base d'un composant de détail. */
export interface DetailProps<T> {
    /** Handler de fermeture du détail. */
    closeDetail: () => void;
    /** Elément de liste sélectionné. */
    data: T;
}

/** Props de base d'un composant d'empty state. */
export interface EmptyProps<T> {
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Store de la liste. */
    store?: ListStoreBase<T>;
}

/** Props du composant de liste standard. */
export interface ListProps<T> extends ListBaseProps<T> {
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Précise si chaque élément peut ouvrir le détail ou non. Par défaut () => true. */
    canOpenDetail?: (data: T) => boolean;
    /** Composant de détail, à afficher dans un "accordéon" au clic sur un objet. */
    DetailComponent?: ReactComponent<DetailProps<T>>;
    /** Hauteur du composant de détail. Par défaut : 200. */
    detailHeight?: number | ((data: T) => number);
    /** Nombre d'éléments à partir du quel on n'affiche plus d'animation de drag and drop sur les lignes. */
    disableDragAnimThreshold?: number;
    /** Type de l'item de liste pour le drag and drop. Par défaut : "item". */
    dragItemType?: string;
    /** CSS du DragLayer. */
    dragLayerTheme?: DragLayerStyle;
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: ReactComponent<EmptyProps<T>>;
    /** Active le drag and drop. */
    hasDragAndDrop?: boolean;
    /** Cache le bouton "Ajouter" dans la mosaïque et le composant vide. */
    hideAdditionalItems?: boolean;
    /** Composant de ligne. */
    LineComponent?: ReactComponent<LineProps<T>>;
    /** Mode des listes dans le wrapper. Par défaut : celui du composant fourni, ou "list". */
    mode?: "list" | "mosaic";
    /** Taille de la mosaïque. */
    mosaic?: {width: number, height: number};
    /** Composant de mosaïque. */
    MosaicComponent?: ReactComponent<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste. */
    operationList?: (data: T) => OperationListItem<T>[];
}

/** Description d'un élément de liste, pour react-motion. */
export interface LineItem<P> {
    /** Clé React. */
    key: string;
    /** Description du composant, avec ses props. */
    data: {
        Component: ReactComponent<P>,
        props?: P
    };
    /** Style interpolé (ou pas) par react-motion. */
    style: Style;
}

/** Composant de liste standard */
@observer
export class List<T, P extends ListProps<T> = ListProps<T> & {data: T[]}> extends ListBase<T, P> {

    // On récupère les infos du ListWrapper dans le contexte.
    static contextTypes = {
        listWrapper: PropTypes.object
    };

    context!: {
        listWrapper?: {
            addItemHandler: () => void;
            mosaic: {
                width: number;
                height: number;
            },
            mode: "list" | "mosaic";
        }
    };

    /** Nombre de mosaïque par ligne, déterminé à la volée. */
    @observable private byLine!: number;
    /** Index de l'item sur lequel on doit afficher le détail. */
    @observable private displayedIdx?: number;

    /** Liste des éléments sélectionnés par le drag and drop. */
    private readonly draggedItems = observable<T>([]);

    /** LineWrapper avec la DragSource, pour une liste avec drag and drop. */
    private readonly DraggableLineWrapper = this.props.hasDragAndDrop ? addDragSource<T>(this.props.dragItemType || "item", LineWrapper) : undefined;

    // Tuyauterie pour maintenir `byLine` à jour.
    componentDidMount() {
        super.componentDidMount();
        window.addEventListener("resize", this.updateByLine);
    }

    componentDidUpdate() {
        this.updateByLine();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        window.removeEventListener("resize", this.updateByLine);
    }

    /** Met à jour `byLine`. */
    @classAutorun
    protected readonly updateByLine = () => {
        const node = findDOMNode(this);
        if (node) {
            this.byLine = this.mode === "mosaic" ? Math.floor(node.clientWidth / (this.mosaic.width + 10)) : 1;
        }
    }

    /** Réaction pour fermer le détail si la liste change. */
    @classReaction((that: List<any, any>) => () => that.displayedData.length)
    protected readonly closeDetail = () => {
        this.displayedIdx = undefined;
    }

    /** Handler d'ajout d'élément (fusion contexte / props). */
    @computed
    protected get addItemHandler() {
        const {listWrapper} = this.context;
        return this.props.addItemHandler || listWrapper && listWrapper.addItemHandler;
    }

    /** Mode (fusion contexte / props). */
    @computed
    protected get mode() {
        const {mode, MosaicComponent, LineComponent} = this.props;
        const {listWrapper} = this.context;
        return mode || listWrapper && listWrapper.mode || MosaicComponent && !LineComponent && "mosaic" || "list";
    }

    /** Taille de la mosaïque (fusion contexte / props). */
    @computed
    protected get mosaic() {
        const {listWrapper} = this.context;
        return this.props.mosaic || listWrapper && listWrapper.mosaic || {width: 200, height: 200};
    }

    /** Les données. */
    protected get data() {
        return (this.props as any).data || [];
    }

    /** Affiche ou non l'ajout d'élément dans la liste (en mosaïque). */
    @computed
    private get isAddItemShown() {
        return !!(!this.props.hideAdditionalItems && this.addItemHandler && this.mode === "mosaic");
    }

    /** Désactive l'animation de drag and drop sur les lignes. */
    @computed
    private get disableDragAnimation() {
        const {disableDragAnimThreshold} = this.props;
        if (disableDragAnimThreshold === undefined) {
            return false;
        } else {
            return disableDragAnimThreshold <= this.displayedData.length;
        }
    }

    /**
     * Transforme les données en éléments de liste.
     * @param Component Le composant de ligne.
     */
    protected getItems(Component: ReactComponent<LineProps<T>>): LineItem<LineWrapperProps<T>>[] {
        const {canOpenDetail = () => true, i18nPrefix, itemKey, lineTheme, operationList, hasDragAndDrop} = this.props;

        return this.displayedData.map((item, idx) => ({
                // On essaie de couvrir toutes les possibilités pour la clé, en tenant compte du faite qu'on a potentiellement une liste de StoreNode.
            key: `${itemKey && item[itemKey] && (item[itemKey] as any).value || itemKey && item[itemKey] || idx}`,
                data: {
                    Component: this.DraggableLineWrapper || LineWrapper,
                    props: {
                        data: item,
                        disableDragAnimation: this.disableDragAnimation,
                        draggedItems: hasDragAndDrop ? this.draggedItems : undefined,
                        i18nPrefix,
                        mosaic: this.mode === "mosaic" ? this.mosaic : undefined,
                        LineComponent: Component,
                        openDetail: canOpenDetail(item) ? () => this.onLineClick(idx) : undefined,
                        operationList,
                        theme: lineTheme
                    }
                },
                // Masque l'élément s'il est en train d'être déplacé par le drag and drop.
                style: {opacity: this.draggedItems.find(i => i === item) ? 0 : 1}
            }));
    }

    /**
     * Ouvre le détail au clic sur un élément.
     * @param idx L'index de l'élément cliqué.
     */
    @action.bound
    protected onLineClick(idx: number) {
        this.displayedIdx = this.displayedIdx !== idx ? idx : undefined;
    }

    /** Construit les lignes de la liste à partir des données, en tenant compte du mode, de l'affichage du détail et du bouton d'ajout. */
    @computed
    private get lines() {
        const {theme, i18nPrefix = "focus", LineComponent, MosaicComponent, DetailComponent, detailHeight = 200} = this.props;

        /* On détermine quel composant on utilise. */
        let Component;
        if (this.mode === "list" && LineComponent) {
            Component = LineComponent;
        } else if (this.mode === "mosaic" && MosaicComponent) {
            Component = MosaicComponent;
        } else {
            throw new Error("Aucun component de ligne ou de mosaïque n'a été précisé.");
        }

        /* On récupère les items de la liste. */
        const items: LineItem<any>[] = this.getItems(Component);

        /* On regarde si le composant de détail doit être ajouté. */
        if (DetailComponent && this.displayedIdx !== undefined) {
            // On détermine son index.
            let idx = this.displayedIdx + (this.isAddItemShown || this.mode === "list" ? 1 : 0);

            // En mosaïque, on affiche le détail juste après une fin de ligne au lieu de juste après l'élément cliqué.
            if (this.mode === "mosaic") {
                idx += this.byLine - idx % this.byLine - (this.isAddItemShown ? 1 : 0);
            }
            const item = this.displayedData[this.displayedIdx];

            // Puis on ajoute l'élément à sa place dans la liste.
            items.splice(idx, 0, {
                key: `detail-${idx}`,
                data: {
                    Component: ({style: {height}}: {style: {height: number}}) => (
                        <li
                            className={theme!.detailWrapper}
                            style={{
                                width: height < 1 ? 0 : undefined, // react-motion prend un moment avant que la hauteur atteigne bien 0, donc on essaie de masquer le composant en avance.
                                height: Math.round(height)
                            }}
                        >
                            {/* Le calcul de la position du triangle en mosaïque n'est pas forcément évident... et il suppose qu'on ne touche pas au marges par défaut entre les mosaïques. */}
                            <div className={theme!.triangle} style={this.displayedIdx === undefined && this.mode === "mosaic" ? {left: -1000} : this.mode === "mosaic" ? {left: this.mosaic.width / 2 - 8.25 + ((this.displayedIdx! + (this.isAddItemShown ? 1 : 0)) % this.byLine) * (this.mosaic.width + 10)} : {}} />
                            <div className={theme!.detail}>
                                <IconButton icon="clear" onClick={this.closeDetail} />
                                <DetailComponent data={item} closeDetail={this.closeDetail} />
                            </div>
                        </li>
                    )
                },
                style: {height: spring((typeof detailHeight === "number" ? detailHeight : detailHeight(item)) + 40)} // On indique l'animation d'ouverture. Le +40 permet de prendre en compte les marges de 20px en haut et en bas.
            });
        }

        /* On regarde si on doit ajouter l'élément d'ajout. */
        if (this.isAddItemShown) {
            items.splice(0, 0, {
                key: "mosaic-add",
                data: {
                    Component: () => (
                        <div
                            className={theme!.mosaicAdd}
                            style={{width: this.mosaic.width, height: this.mosaic.height}}
                            onClick={this.addItemHandler}
                        >
                            <FontIcon className={theme!.add}>{getIcon(`${i18nPrefix}.icons.list.add`)}</FontIcon>
                            {i18next.t(`${i18nPrefix}.list.add`)}
                        </div>
                    )
                },
                style: {}
            });
        }

        return items;
    }

    render() {
        const {dragLayerTheme, EmptyComponent, hasDragAndDrop, hideAdditionalItems, i18nPrefix = "focus", theme} = this.props;
        return !hideAdditionalItems && !this.displayedData.length && EmptyComponent ?
            <EmptyComponent addItemHandler={this.addItemHandler} store={(this.props as any).store} />
        : !hideAdditionalItems && !this.displayedData.length ?
            <div>{i18next.t(`${i18nPrefix}.list.empty`)}</div>
        : (
            <div>
                {!navigator.userAgent.match(/Trident/) && hasDragAndDrop ? <DndDragLayer i18nPrefix={i18nPrefix} theme={dragLayerTheme} /> : null}
                <div className={this.mode === "list" ? theme!.list : theme!.mosaic}>
                    <TransitionMotion
                        willEnter={() => ({height: 0, opacity: 1})}
                        willLeave={({style}: {style: Style}) => {
                            // Est appelé au retrait d'un élément de la liste.
                            if (style.height) { // `height` n'existe que pour le détail
                                return {height: spring(0)}; // On ajoute l'animation de fermeture.
                            }
                            return undefined; // Pour les autres éléments, on les retire immédiatement.
                        }}
                        styles={this.lines.slice()}
                    >
                        {(items: LineItem<any>[]) => (
                            <ul>
                                {items.map(({key, style, data: {Component, props}}) => <Component key={key} style={style} {...props} />)}
                            </ul>
                        )}
                    </TransitionMotion>
                    {this.renderBottomRow()}
                </div>
            </div>
        );
    }
}

const ThemedList = themr("list", styles)(List);
export default ThemedList;

/**
 * Crée un composant de liste standard.
 * @param props Les props de la liste.
 */
export function listFor<T>(props: ListProps<T> & {data: T[]}) {
    const List2 = ThemedList as any;
    return <List2 {...props} />;
}
