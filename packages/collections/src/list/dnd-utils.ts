import {IObservableArray, runInAction} from "mobx";
import {DropTargetMonitor, useDrag} from "react-dnd";

import {ListStoreBase} from "@focus4/stores";

export function useDragSource<T>({
    data,
    draggedItems,
    store,
    type
}: {
    data: T;
    draggedItems: IObservableArray<T>;
    store?: ListStoreBase<T>;
    type: string;
}) {
    return useDrag({
        item: {type, dragged: draggedItems},
        /** Est appelé au lancement du drag. */
        begin() {
            // Si on a un store, on va regarder si on a des éléments sélectionnés.
            if (store) {
                // Si l'élément en cours de drag est sélectionné, alors on embarque tous les éléments sélectionnés.
                if (store.selectedItems.has(data)) {
                    runInAction("selectDraggedItems", () =>
                        store.selectedItems.forEach((item: T) => draggedItems.push(item))
                    );
                } else {
                    // Sinon, simplement l'élément en cours.
                    draggedItems.push(data);
                }
            } else {
                // Idem.
                draggedItems.push(data);
            }
        },
        /** Vide la liste d'élements à la fin du drag. */
        end() {
            draggedItems.clear();
        }
    });
}

/**
 * Récupère les élements en cours de drag and drop.
 * @param monitor Le monitor react-dnd.
 */
export function getDraggedItems<T>(monitor: DropTargetMonitor | undefined) {
    return monitor!.getItem().dragged as T[];
}
