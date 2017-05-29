import {autobind} from "core-decorators";
import i18n from "i18next";
import {computed} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import {IconButton} from "react-toolbox/lib/button";

import {EntityField, stringFor} from "../../entity";

import {MiniListStore} from "../store-base";
import ContextualActions, {LineOperationListItem} from "./contextual-actions";

import * as styles from "./__style__/line.css";

export type LineStyle = Partial<typeof styles>;

/** Props du wrapper autour des lignes de liste. */
export interface LineWrapperProps<T, P extends {data?: T}> {
    data: T;
    dateSelector?: (data: T) => EntityField<string>;
    hasSelection?: boolean;
    i18nPrefix?: string;
    LineComponent: React.ComponentClass<P> | React.SFC<P>;
    lineProps?: P;
    mosaic?: {width: number, height: number};
    onLineClick?: () => void;
    operationList?: (data: T) => LineOperationListItem<T>[];
    selectionnableInitializer?: (data: T) => boolean;
    store?: MiniListStore<T>;
    theme?: LineStyle;
    type?: "table" | "timeline";
}

/** Wrapper de ligne dans une liste. */
@autobind
@observer
export class LineWrapper<T, P extends {data?: T}> extends React.Component<LineWrapperProps<T, P>, void> {

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
        const {LineComponent, onLineClick, data, dateSelector, lineProps = {} as any, hasSelection, i18nPrefix = "focus", mosaic, selectionnableInitializer, theme, operationList, type, store} = this.props;
        switch (type) {
            case "table": // Pour un tableau, on laisse l'utiliseur spécifier ses lignes de tableau directement.
                return <LineComponent data={data} {...lineProps} />;
            case "timeline": // Pour une timeline, on wrappe simplement la ligne dans le conteneur de timeline qui affiche la date et la décoration de timeline.
                return (
                    <li>
                        <div className={theme!.timelineDate!}>{stringFor(dateSelector!(data))}</div>
                        <div className={theme!.timelineBadge!}></div>
                        <div className={theme!.timelinePanel!}>
                            <LineComponent data={data} {...lineProps} />
                        </div>
                    </li>
                );
            default: // Pour une liste, on ajoute éventuellement la case à cocher et les actions de ligne.
                const opList = operationList && operationList(data);
                return (
                    <li
                        className={mosaic ? theme!.mosaic! : theme!.line!}
                        style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}
                    >
                        {hasSelection && selectionnableInitializer!(data) && store ?
                            <IconButton
                                className={`${theme!.checkbox!} ${store.selectedItems.size ? theme!.isSelection! : ""}`}
                                icon={i18n.t(`${i18nPrefix}.icons.line.${this.isSelected ? "" : "un"}selected.name`)}
                                onClick={this.onSelection}
                                primary={this.isSelected}
                            />
                        : null}
                        <div onClick={onLineClick}>
                            <LineComponent data={data} {...lineProps} />
                        </div>
                        {opList && opList.length > 0 ?
                            <div
                                className={theme!.actions!}
                                style={mosaic ? {width: mosaic.width, height: mosaic.height} : {}}
                            >
                                <ContextualActions
                                    buttonShape={mosaic ? "mini-fab" : null}
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

// iconLibrary={i18n.t(`${i18nPrefix}.icons.line.${this.isSelected ? "" : "un"}selected.library` )}
