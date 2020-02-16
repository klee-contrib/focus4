import i18next from "i18next";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import * as React from "react";

import {CSSProp, getIcon, themr} from "@focus4/styling";
import {Button, IconButton as IB, tooltipFactory} from "@focus4/toolbox";

import listWrapperCss, {ListWrapperCss} from "./__style__/list-wrapper.css";
export {listWrapperCss, ListWrapperCss};
const Theme = themr("listWrapper", listWrapperCss);

const IconButton = tooltipFactory()(IB);

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
    theme?: CSSProp<ListWrapperCss>;
}

export const lwcInit = {
    addItemHandler: () => {
        /*noop */
    },
    mosaic: {width: 200, height: 200},
    mode: "list" as "list" | "mosaic"
};
export const ListWrapperContext = React.createContext(lwcInit);

/** Wrapper de liste permettant de partager le mode d'affichage de toutes les listes qu'il contient. */
@observer
export class ListWrapper extends React.Component<ListWrapperProps> {
    /** Objet passé en contexte pour les listes contenues dans le wrapper. */
    listWrapperContext: typeof lwcInit = observable(
        {
            /** Handler au clic sur le bouton "Ajouter". */
            addItemHandler: this.props.addItemHandler || lwcInit.addItemHandler,
            /** Taile des mosaïques. */
            mosaic: {
                width: this.props.mosaicWidth || lwcInit.mosaic.width,
                height: this.props.mosaicHeight || lwcInit.mosaic.height
            },
            /** Mode des listes. */
            mode: this.props.mode || lwcInit.mode
        },
        {
            addItemHandler: observable.ref
        }
    );

    // On met à jour l'objet passé en contexte à chaque fois qu'on change les props du composant.
    @action
    UNSAFE_componentWillReceiveProps({addItemHandler, mode, mosaicHeight, mosaicWidth}: ListWrapperProps) {
        if (this.props.addItemHandler !== addItemHandler) {
            this.listWrapperContext.addItemHandler = addItemHandler || lwcInit.addItemHandler;
        }
        if (mode && this.props.mode !== mode) {
            this.listWrapperContext.mode = mode;
        }
        if (mosaicWidth && this.props.mosaicWidth !== mosaicWidth) {
            this.listWrapperContext.mosaic.width = mosaicWidth;
        }
        if (mosaicHeight && this.props.mosaicHeight !== mosaicHeight) {
            this.listWrapperContext.mosaic.height = mosaicHeight;
        }
    }

    render() {
        const {children, canChangeMode, hideAddItemHandler, i18nPrefix = "focus"} = this.props;
        const {mode, addItemHandler} = this.listWrapperContext;
        return (
            <ListWrapperContext.Provider value={this.listWrapperContext}>
                <Theme theme={this.props.theme}>
                    {theme => (
                        <div className={theme.wrapper()}>
                            <div className={theme.bar()}>
                                {canChangeMode ? (
                                    <IconButton
                                        accent={mode === "list"}
                                        onClick={() => (this.listWrapperContext.mode = "list")}
                                        icon={getIcon(`${i18nPrefix}.icons.listWrapper.list`)}
                                        tooltip={i18next.t(`${i18nPrefix}.list.mode.list`)}
                                    />
                                ) : null}
                                {canChangeMode ? (
                                    <IconButton
                                        accent={mode === "mosaic"}
                                        onClick={() => (this.listWrapperContext.mode = "mosaic")}
                                        icon={getIcon(`${i18nPrefix}.icons.listWrapper.mosaic`)}
                                        tooltip={i18next.t(`${i18nPrefix}.list.mode.mosaic`)}
                                    />
                                ) : null}
                                {!hideAddItemHandler && addItemHandler !== lwcInit.addItemHandler && mode === "list" ? (
                                    <Button
                                        onClick={addItemHandler}
                                        icon={getIcon(`${i18nPrefix}.icons.listWrapper.add`)}
                                        label={i18next.t(`${i18nPrefix}.list.add`)}
                                    />
                                ) : null}
                            </div>
                            {children}
                        </div>
                    )}
                </Theme>
            </ListWrapperContext.Provider>
        );
    }
}
