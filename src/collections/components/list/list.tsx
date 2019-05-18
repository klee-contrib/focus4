import i18next from "i18next";
import {action, autorun, comparer, computed, observable, reaction} from "mobx";
import {disposeOnUnmount, observer} from "mobx-react";
import * as React from "react";
import posed, {Transition} from "react-pose";
import {IconButton} from "react-toolbox/lib/button";
import {FontIcon} from "react-toolbox/lib/font_icon";

import {defaultPose} from "../../../animation";
import {getIcon} from "../../../components";
import {themr} from "../../../theme";

import {ListStoreBase} from "../../store";
import {OperationListItem} from "./contextual-actions";
import {addDragSource} from "./dnd-utils";
import {DndDragLayer, DragLayerStyle} from "./drag-layer";
import {LineProps, LineWrapper, LineWrapperProps} from "./line";
import {ListBase, ListBaseProps, ListStyle} from "./list-base";
import {ListWrapperContext, lwcInit} from "./list-wrapper";

import * as styles from "./__style__/list.css";
const Theme = themr("list", styles);

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

/** Props de base d'un composant de chargement. */
export interface LoadingProps<T> {
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
    DetailComponent?: React.ComponentType<DetailProps<T>>;
    /** Nombre d'éléments à partir du quel on n'affiche plus d'animation de drag and drop sur les lignes. */
    disableDragAnimThreshold?: number;
    /** Type de l'item de liste pour le drag and drop. Par défaut : "item". */
    dragItemType?: string;
    /** CSS du DragLayer. */
    dragLayerTheme?: DragLayerStyle;
    /** Component à afficher lorsque la liste est vide. */
    EmptyComponent?: React.ComponentType<EmptyProps<T>>;
    /** Active le drag and drop. */
    hasDragAndDrop?: boolean;
    /** Cache le bouton "Ajouter" dans la mosaïque et le composant vide. */
    hideAdditionalItems?: boolean;
    /** Précise si la liste est en cours de chargement (surchargé par le store si disponible). */
    isLoading?: boolean;
    /** Composant de ligne. */
    LineComponent?: React.ComponentType<LineProps<T>>;
    /** Composant à afficher pendant le chargement. */
    LoadingComponent?: React.ComponentType<LoadingProps<T>>;
    /** Mode des listes dans le wrapper. Par défaut : celui du composant fourni, ou "list". */
    mode?: "list" | "mosaic";
    /** Taille de la mosaïque. */
    mosaic?: {width: number; height: number};
    /** Composant de mosaïque. */
    MosaicComponent?: React.ComponentType<LineProps<T>>;
    /** La liste des actions sur chaque élément de la liste. */
    operationList?: (data: T) => OperationListItem<T>[];
}

/** Composant de liste standard */
@observer
export class List<T, P extends ListProps<T> = ListProps<T> & {data: T[]}> extends ListBase<T, P> {
    /** Nombre de mosaïque par ligne, déterminé à la volée. */
    @observable private byLine!: number;
    /** Index de l'item sur lequel on doit afficher le détail. */
    @observable private displayedIdx?: number;
    /** Ref vers la liste pour déterminer sa largeur. */
    @observable private ulRef?: HTMLUListElement | null;

    /** Liste des éléments sélectionnés par le drag and drop. */
    protected readonly draggedItems = observable<T>([]);

    /** LineWrapper (avec la DragSource, pour une liste avec drag and drop). */
    private readonly LineWrapper = this.props.hasDragAndDrop
        ? (addDragSource<T>(this.props.dragItemType || "item", LineWrapper) as typeof LineWrapper)
        : LineWrapper;

    /** Met à jour `byLine`. */
    private readonly updateByLine = () => {
        if (this.ulRef) {
            this.byLine = this.mode === "mosaic" ? Math.floor(this.ulRef.clientWidth / (this.mosaic.width + 10)) : 1;
        }
    };

    // Tuyauterie pour maintenir `byLine` à jour.
    componentDidMount() {
        window.addEventListener("resize", this.updateByLine);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateByLine);
    }

    @disposeOnUnmount
    protected byLineUpdater = autorun(this.updateByLine);

    /** Toggle le détail depuis la ligne. */
    @action.bound
    protected async toggleDetail(
        idx: number,
        {onOpen, onClose}: {onOpen?: () => Promise<void> | void; onClose?: () => Promise<void> | void} = {}
    ) {
        this.displayedIdx = this.displayedIdx !== idx ? idx : undefined;
        if (this.displayedIdx && onOpen) {
            await onOpen();
        }
        if (!this.displayedIdx && onClose) {
            await onClose();
        }
    }

    /** Ferme le détail. */
    @action.bound
    protected closeDetail() {
        this.displayedIdx = undefined;
    }

    /** Réaction pour fermer le détail si la liste change. */
    @disposeOnUnmount
    protected detailCloser = reaction(() => this.displayedData.map(this.props.itemKey), this.closeDetail, {
        fireImmediately: true,
        equals: comparer.structural
    });

    /** Handler d'ajout d'élément (fusion contexte / props). */
    @computed
    protected get addItemHandler() {
        return this.props.addItemHandler || lwcInit.addItemHandler;
    }

    /** Mode (fusion contexte / props). */
    @computed
    protected get mode() {
        const {mode, MosaicComponent, LineComponent} = this.props;
        return mode || (MosaicComponent && !LineComponent && "mosaic") || lwcInit.mode;
    }

    /** Taille de la mosaïque (fusion contexte / props). */
    @computed
    protected get mosaic() {
        return this.props.mosaic || lwcInit.mosaic;
    }

    /** Les données. */
    protected get data() {
        return (this.props as any).data || [];
    }

    /** Précise si la liste est en cours de chargement. */
    @computed
    protected get isLoading() {
        return this.props.isLoading || false;
    }

    /** Affiche ou non l'ajout d'élément dans la liste (en mosaïque). */
    @computed
    protected get isAddItemShown() {
        return !!(
            !this.props.hideAdditionalItems &&
            this.addItemHandler !== lwcInit.addItemHandler &&
            this.mode === "mosaic"
        );
    }

    /** Désactive l'animation de drag and drop sur les lignes. */
    @computed
    protected get disableDragAnimation() {
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
    protected getItems(): LineWrapperProps<T>[] {
        const {
            DetailComponent,
            LineComponent,
            MosaicComponent,
            canOpenDetail = () => true,
            i18nPrefix,
            itemKey,
            lineTheme,
            operationList,
            pageItemIndex = 5,
            hasDragAndDrop
        } = this.props;

        /* On détermine quel composant on utilise. */
        let Component: React.ComponentType<LineProps<T>>;
        if (this.mode === "list" && LineComponent) {
            Component = LineComponent;
        } else if (this.mode === "mosaic" && MosaicComponent) {
            Component = MosaicComponent;
        } else {
            throw new Error("Aucun component de ligne ou de mosaïque n'a été précisé.");
        }

        return this.displayedData.map((item, idx) => ({
            key: itemKey(item, idx),
            data: item,
            domRef:
                this.displayedData.length - idx === pageItemIndex ||
                (this.displayedData.length < pageItemIndex && this.displayedData.length - 1 === idx)
                    ? this.registerSentinel
                    : undefined,
            disableDragAnimation: this.disableDragAnimation,
            draggedItems: hasDragAndDrop ? this.draggedItems : undefined,
            i18nPrefix,
            mosaic: this.mode === "mosaic" ? this.mosaic : undefined,
            LineComponent: Component,
            toggleDetail:
                canOpenDetail(item) && DetailComponent
                    ? (callbacks?: {}) => this.toggleDetail(idx, callbacks)
                    : undefined,
            operationList,
            theme: lineTheme
        }));
    }

    /** Construit les lignes de la liste à partir des données, en tenant compte du mode et de l'affichage du détail. */
    @computed
    private get lines() {
        const {DetailComponent, theme} = this.props;

        /* On récupère les items de la liste. */
        const items = this.getItems().map(props => <this.LineWrapper {...props} />);

        /* On regarde si le composant de détail doit être ajouté. */
        if (DetailComponent && this.displayedIdx !== undefined) {
            const idx =
                this.mode === "list"
                    ? this.displayedIdx + 1
                    : (Math.floor((this.displayedIdx + (this.isAddItemShown ? 1 : 0)) / this.byLine) + 1) *
                          this.byLine -
                      (this.isAddItemShown ? 1 : 0);

            // Puis on ajoute l'élément à sa place dans la liste.
            items.splice(
                idx,
                0,
                <DetailWrapper
                    displayedIdx={this.displayedIdx}
                    DetailComponent={DetailComponent as any}
                    byLine={this.byLine}
                    closeDetail={this.closeDetail}
                    isAddItemShown={this.isAddItemShown}
                    item={this.displayedData[this.displayedIdx]}
                    mode={this.mode}
                    mosaic={this.mosaic}
                    theme={theme}
                    key={`detail-${idx}`}
                />
            );
        }

        return items;
    }

    render() {
        const {
            DetailComponent,
            dragLayerTheme,
            EmptyComponent,
            LoadingComponent,
            hasDragAndDrop,
            hideAdditionalItems,
            i18nPrefix = "focus"
        } = this.props;
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <>
                        {!navigator.userAgent.match(/Trident/) && hasDragAndDrop ? (
                            <DndDragLayer i18nPrefix={i18nPrefix} theme={dragLayerTheme} />
                        ) : null}
                        <div className={this.mode === "list" ? theme.list : theme.mosaic}>
                            {/* Gestion de l'empty state. */}
                            {!this.isLoading && !hideAdditionalItems && !this.displayedData.length ? (
                                EmptyComponent ? (
                                    <EmptyComponent
                                        addItemHandler={this.addItemHandler}
                                        store={(this.props as any).store}
                                    />
                                ) : (
                                    <div className={theme.loading}>{i18next.t(`${i18nPrefix}.list.empty`)}</div>
                                )
                            ) : (
                                <ul ref={ul => (this.ulRef = ul)}>
                                    {/* On regarde si on doit ajouter l'élément d'ajout. */}
                                    {this.isAddItemShown ? (
                                        <li
                                            key="mosaic-add"
                                            className={theme.mosaicAdd}
                                            style={{width: this.mosaic.width, height: this.mosaic.height}}
                                            onClick={this.addItemHandler}
                                        >
                                            <FontIcon className={theme.add}>
                                                {getIcon(`${i18nPrefix}.icons.list.add`)}
                                            </FontIcon>
                                            {i18next.t(`${i18nPrefix}.list.add`)}
                                        </li>
                                    ) : null}
                                    {DetailComponent ? <Transition>{this.lines}</Transition> : this.lines}
                                </ul>
                            )}
                            {/* Gestion de l'affichage du chargement. */}
                            {this.isLoading ? (
                                LoadingComponent ? (
                                    <LoadingComponent store={(this.props as any).store} />
                                ) : (
                                    <div className={theme.loading}>{i18next.t(`${i18nPrefix}.search.loading`)}</div>
                                )
                            ) : null}
                            {this.renderBottomRow(theme)}
                        </div>
                    </>
                )}
            </Theme>
        );
    }
}

/**
 * Crée un composant de liste standard.
 * @param props Les props de la liste.
 */
export function listFor<T>(props: ListProps<T> & {data: T[]}) {
    return <ListWithWrapperContext<T> {...props} />;
}

function ListWithWrapperContext<T>(props: ListProps<T> & {data: T[]}) {
    // On récupère les infos du ListWrapper dans le contexte.
    const {addItemHandler, mode, mosaic} = React.useContext(ListWrapperContext);
    return <List<T> addItemHandler={addItemHandler} mode={mode} mosaic={mosaic} {...props} />;
}

/** Props du composant wrapper du détail. */
interface DetailWrapperProps {
    displayedIdx: number;
    mode: "list" | "mosaic";
    mosaic: {width: number; height: number};
    isAddItemShown: boolean;
    byLine: number;
    DetailComponent: React.ComponentType<DetailProps<{}>>;
    closeDetail: () => void;
    item: {};
    theme?: ListStyle;
}

/** Wrapper pour le composant de détail. */
const DetailWrapper: React.ComponentType<DetailWrapperProps> = posed(
    React.forwardRef(
        (
            {
                displayedIdx,
                mode,
                mosaic,
                isAddItemShown,
                byLine,
                DetailComponent,
                closeDetail,
                item,
                theme: pTheme
            }: DetailWrapperProps,
            ref: React.Ref<HTMLLIElement>
        ) => (
            <Theme theme={pTheme}>
                {theme => (
                    <li ref={ref} className={theme.detailWrapper}>
                        {/* Le calcul de la position du triangle en mosaïque n'est pas forcément évident...
                        et il suppose qu'on ne touche pas au marges par défaut entre les mosaïques. */}
                        <div
                            className={theme.triangle}
                            style={
                                displayedIdx === undefined && mode === "mosaic"
                                    ? {left: -1000}
                                    : mode === "mosaic"
                                    ? {
                                          left:
                                              mosaic.width / 2 -
                                              8.25 +
                                              ((displayedIdx! + (isAddItemShown ? 1 : 0)) % byLine) *
                                                  (mosaic.width + 10)
                                      }
                                    : {}
                            }
                        />
                        <div className={theme.detail}>
                            <IconButton icon="clear" onClick={closeDetail} />
                            <DetailComponent data={item} closeDetail={closeDetail} />
                        </div>
                    </li>
                )}
            </Theme>
        )
    )
)({
    enter: {
        applyAtStart: {overflow: "hidden"},
        applyAtEnd: {overflow: "visible"},
        height: "auto",
        ...defaultPose
    },
    exit: {
        applyAtStart: {overflow: "hidden"},
        applyAtEnd: {overflow: "visible"},
        height: 0,
        ...defaultPose
    }
});
