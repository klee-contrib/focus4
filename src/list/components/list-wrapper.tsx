import {autobind} from "core-decorators";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Button from "focus-components/button";

import * as styles from "./__style__/list-wrapper.css";

export type ListWrapperStyle = Partial<typeof styles>;

/** Props du wrapper de liste. */
export interface ListWrapperProps {
    /** Handler au clic sur le bouton "Ajouter". */
    addItemHandler?: () => void;
    /** Affiche le bouton de changement de mode liste / mosaïque. */
    canChangeMode?: boolean;
    /** Cache le bouton "Ajouter." */
    hideAddItemHandler?: boolean;
    /** Préfixe i18n pour les libellés de la liste. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Mode des listes dans le wrapper. Par défaut : "list". */
    mode?: "list" | "mosaic";
    /** Largeur des mosaïques. Par défaut : 200. */
    mosaicWidth?: number;
    /** Hauteur des mosaïques. Par défaut : 200. */
    mosaicHeight?: number;
    /** CSS. */
    theme?: ListWrapperStyle;
}

/** Wrapper de liste permettant de partager le mode d'affichage de toutes les listes qu'il contient. */
@themr("listWrapper", styles)
@autobind
@observer
export class ListWrapper extends React.Component<ListWrapperProps, void> {

    // On utilise le contexte React pour partager le mode entre les listes.
    static childContextTypes = {
        listWrapper: React.PropTypes.object
    };

    /** Objet passé en contexte pour les listes contenues dans le wrapper. */
    @observable childContext = {
        /** Handler au clic sur le bouton "Ajouter". */
        addItemHandler: observable.ref(this.props.addItemHandler),
        /** Taile des mosaïques. */
        mosaic: {
            width: this.props.mosaicWidth || 200,
            height: this.props.mosaicHeight || 200
        },
        /** Mode des listes. */
        mode: this.props.mode || "list"
    };

    // On met à jour l'objet passé en contexte à chaque fois qu'on change les props du composant.
    @action
    componentWillReceiveProps({addItemHandler, mode, mosaicHeight, mosaicWidth}: ListWrapperProps) {
        if (this.props.addItemHandler !== addItemHandler) {
            this.childContext.addItemHandler = addItemHandler;
        }
        if (mode && this.props.mode !== mode) {
            this.childContext.mode = mode;
        }
        if (mosaicWidth && this.props.mosaicWidth !== mosaicWidth) {
            this.childContext.mosaic.width = mosaicWidth;
        }
        if (mosaicHeight && this.props.mosaicHeight !== mosaicHeight) {
            this.childContext.mosaic.height = mosaicHeight;
        }
    }

    getChildContext() {
        return {listWrapper: this.childContext};
    }

    render() {
        const {theme, children, canChangeMode, hideAddItemHandler, i18nPrefix = "focus"} = this.props;
        const {mode, addItemHandler} = this.childContext;
        return (
            <div className={theme!.wrapper!}>
                <div className={theme!.bar!}>
                    {canChangeMode ?
                        <Button
                            color={mode === "list" ? "accent" : undefined}
                            onClick={() => this.childContext.mode = "list"}
                            icon="list"
                            shape="icon"
                            type="button"
                            label={`${i18nPrefix}.list.mode.list`}
                        />
                    : null}
                    {canChangeMode ?
                        <Button
                            color={mode === "mosaic" ? "accent" : undefined}
                            onClick={() => this.childContext.mode = "mosaic"}
                            icon="apps"
                            shape="icon"
                            type="button"
                            label={`${i18nPrefix}.list.mode.mosaic`}
                        />
                    : null}
                    {!hideAddItemHandler && addItemHandler && mode === "list" ?
                        <Button
                            onClick={addItemHandler}
                            icon="add"
                            label={`${i18nPrefix}.list.add`}
                            shape={null}
                            type="button"
                        />
                    : null}
                </div>
                {children}
            </div>
        );
    }
}
