import {runInAction} from "mobx";
import {DragSource, DropTargetMonitor} from "react-dnd";

import {LineWrapperProps} from "./line";

/**
 * Ajoute la dragSource au LineWrapper.
 * @param type Le type d'élément.
 * @param Component Le LineWrapper.
 */
export function addDragSource<T>(type: string, Component: React.ComponentClass<LineWrapperProps<T>>) {
    return DragSource<LineWrapperProps<T>>(
        type,
        {
            /** Est appelé au lancement du drag. */
            beginDrag({draggedItems, data, store}) {
                // Si on a un store, on va regarder si on a des éléments sélectionnés.
                if (store) {
                    // Si l'élément en cours de drag est sélectionné, alors on embarque tous les éléments sélectionnés.
                    if (store.selectedItems.has(data)) {
                        runInAction("selectDraggedItems", () =>
                            store.selectedItems.forEach((item: T) => draggedItems!.push(item))
                        );
                    } else {
                        // Sinon, simplement l'élément en cours.
                        draggedItems!.push(data);
                    }
                } else {
                    // Idem.
                    draggedItems!.push(data);
                }
                // On wrappe la liste dans un objet pour feinter react-dnd qui veut qu'on renvoie l'objet au lieu d'une liste.
                return {dragged: draggedItems!.slice()};
            },
            /** Pour empêcher le drag and drop si on ne l'a pas activé. */
            canDrag({draggedItems}) {
                return !!draggedItems;
            },
            /** Vide la liste d'élements à la fin du drag. */
            endDrag({draggedItems}) {
                draggedItems!.clear();
            }
        },
        connect => ({
            // On récupère les connecteurs pour le composant.
            connectDragSource: connect.dragSource(),
            connectDragPreview: connect.dragPreview()
        })
    )(Component);
}

/**
 * Récupère les élements en cours de drag and drop.
 * @param monitor Le monitor react-dnd.
 */
export function getDraggedItems<T>(monitor: DropTargetMonitor | undefined) {
    return (monitor!.getItem() as any).dragged as T[];
}
