import {observable} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import {ComponentType, Ref, useEffect} from "react";

import {CollectionStore} from "@focus4/stores";
import {ToBem} from "@focus4/styling";
import {Checkbox} from "@focus4/toolbox";

import {ContextualActions, OperationListItem} from "../contextual-actions";

import {ListCss} from "../__style__/list.css";

/** Props de base d'un composant de ligne. */
export interface LineProps<T extends object> {
    /** Elément de la liste. */
    data: T;
    /** Handler pour ouvrir et fermer le détail. */
    toggleDetail?: (callbacks?: {onOpen?: () => Promise<void> | void; onClose?: () => Promise<void> | void}) => void;
}

/** Props du wrapper autour des lignes de liste. */
export interface LineWrapperProps<T extends object> {
    /** L'élément de liste. */
    data: T;
    /** Ref vers l'élement DOM racine de la ligne. */
    domRef?: (element: HTMLLIElement | null) => void;
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
export function LineWrapper<T extends object>({
    domRef,
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

    return useObserver(() => (
        <li ref={domRef} className={(mosaic ? theme.mosaic : theme.line)({selected: state.isSelected})}>
            <LineComponent data={props.data} toggleDetail={toggleDetail} />
            {state.isSelectable ? (
                <Checkbox className={theme.checkbox()} onChange={state.onSelection} value={state.isSelected} />
            ) : null}
            {operationList?.(props.data) ? (
                <div className={theme.actions()} style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}>
                    <ContextualActions
                        data={props.data}
                        isMosaic={!!mosaic}
                        operationList={operationList(props.data)}
                    />
                </div>
            ) : null}
        </li>
    ));
}
