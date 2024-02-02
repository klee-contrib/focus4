import {motion} from "framer-motion";
import {IObservableArray, observable} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {ComponentType, Ref, useCallback, useEffect, useLayoutEffect} from "react";
import {getEmptyImage} from "react-dnd-html5-backend";

import {CollectionStore} from "@focus4/stores";
import {getSpringTransition, ToBem} from "@focus4/styling";
import {Checkbox} from "@focus4/toolbox";

import {ContextualActions, OperationListItem} from "../contextual-actions";
import {useDragSource} from "../dnd-utils";

import {ListCss} from "../__style__/list.css";

/** Props de base d'un composant de ligne. */
export interface LineProps<T> {
    /** Elément de la liste. */
    data: T;
    /** Handler pour ouvrir et fermer le détail. */
    toggleDetail?: (callbacks?: {onOpen?: () => Promise<void> | void; onClose?: () => Promise<void> | void}) => void;
}

/** Props du wrapper autour des lignes de liste. */
export interface LineWrapperProps<T> {
    /** L'élément de liste. */
    data: T;
    /** Ref vers l'élement DOM racine de la ligne. */
    domRef?: (element: HTMLLIElement | null) => void;
    /** Désactive l'animation de drag and drop. */
    disableDragAnimation?: boolean;
    /** Les items en cours de drag dans la liste. */
    draggedItems?: IObservableArray<T>;
    /** Type de l'item de liste pour le drag and drop. Par défaut : "item". */
    dragItemType?: string;
    /** Affiche ou non la checkbox de sélection. */
    hasSelection?: boolean;
    /** Composant de ligne (ligne, mosaïque, row ou timeline à priori). */
    LineComponent: ComponentType<LineProps<T> & {ref?: Ref<any>}>;
    /** Configuration de la mosaïque (si applicable). */
    mosaic?: {width: number; height: number};
    /** Actions de ligne. */
    operationList?: (data: T) => OperationListItem<T>[];
    /** Store de liste associé à la ligne. */
    store?: CollectionStore<T>;
    /** Handler pour ouvrir et fermer le détail. */
    toggleDetail?: (callbacks?: {onOpen?: () => Promise<void> | void; onClose?: () => Promise<void> | void}) => void;
    /** CSS. */
    theme: ToBem<ListCss>;
}

/** Wrapper de ligne dans une liste. */
export function LineWrapper<T>({
    disableDragAnimation,
    domRef,
    draggedItems,
    dragItemType = "item",
    LineComponent,
    mosaic,
    operationList,
    toggleDetail,
    theme,
    ...oProps
}: LineWrapperProps<T>) {
    const props = useLocalObservable(
        () => ({
            data: oProps.data,
            hasSelection: oProps.hasSelection,
            store: oProps.store
        }),
        {data: observable.ref, store: observable.ref}
    );
    useEffect(() => {
        props.data = oProps.data;
        props.hasSelection = oProps.hasSelection;
        props.store = oProps.store;
    }, [oProps.data, oProps.hasSelection, oProps.store]);

    const state = useLocalObservable(() => ({
        /** Précise si la ligne est en train d'être "draggée". */
        get isDragged() {
            return draggedItems?.find(i => i === props.data) ?? false;
        },

        /** Précise si la ligne est sélectionnable. */
        get isSelectable() {
            return (props.hasSelection && props.store?.isItemSelectionnable(props.data)) ?? false;
        },

        /** Précise si la ligne est sélectionnée.. */
        get isSelected() {
            return props.store?.selectedItems.has(props.data) ?? false;
        },

        /** Handler de clic sur la case de sélection. */
        onSelection() {
            props.store?.toggle(props.data);
        }
    }));

    let setRef = domRef;

    // Gestion du drag and drop
    if (draggedItems) {
        const [, dragSource, dragPreview] = useDragSource({
            data: props.data,
            draggedItems,
            store: props.store,
            type: dragItemType
        });

        // Permet de masquer la preview par défaut de drag and drop HTML5.
        useLayoutEffect(() => {
            if (dragPreview) {
                dragPreview(getEmptyImage());
            }
        }, []);

        setRef = useCallback((li: HTMLLIElement | null) => {
            if (domRef) {
                domRef(li);
            }
            if (dragSource) {
                dragSource(li);
            }
        }, []);
    }

    return useObserver(() => (
        <motion.li
            ref={setRef}
            animate={state.isDragged && !disableDragAnimation ? "dragging" : "idle"}
            className={(mosaic ? theme.mosaic : theme.line)({selected: state.isSelected})}
            exit={{}}
            initial={false}
            style={{opacity: state.isDragged && !disableDragAnimation ? 0 : 1}}
            transition={getSpringTransition()}
            variants={{
                dragging: {
                    width: mosaic?.width ? 0 : undefined,
                    height: 0
                },
                idle: {
                    width: mosaic?.width ?? "100%",
                    height: mosaic?.height ?? "auto"
                }
            }}
        >
            <LineComponent data={props.data} toggleDetail={toggleDetail} />
            {state.isSelectable ? (
                <Checkbox className={theme.checkbox()} onChange={state.onSelection} value={state.isSelected} />
            ) : null}
            {operationList?.(props.data)?.length ? (
                <div className={theme.actions()} style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}>
                    <ContextualActions
                        data={props.data}
                        isMosaic={!!mosaic}
                        operationList={operationList(props.data)}
                    />
                </div>
            ) : null}
        </motion.li>
    ));
}
