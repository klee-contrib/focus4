import i18next from "i18next";
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import * as PropTypes from "prop-types";
import * as React from "react";
import {Button, IconButton as IB} from "react-toolbox/lib/button";
import Tooltip from "react-toolbox/lib/tooltip";

import {getIcon} from "../../../components";
import {themr} from "../../../theme";

import * as styles from "./__style__/list-wrapper.css";
export type ListWrapperStyle = Partial<typeof styles>;
const Theme = themr("listWrapper", styles);

const IconButton = Tooltip(IB);

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
@observer
export class ListWrapper extends React.Component<ListWrapperProps> {
    // On utilise le contexte React pour partager le mode entre les listes.
    static childContextTypes = {
        listWrapper: PropTypes.object
    };

    /** Objet passé en contexte pour les listes contenues dans le wrapper. */
    childContext = observable(
        {
            /** Handler au clic sur le bouton "Ajouter". */
            addItemHandler: this.props.addItemHandler,
            /** Taile des mosaïques. */
            mosaic: {
                width: this.props.mosaicWidth || 200,
                height: this.props.mosaicHeight || 200
            },
            /** Mode des listes. */
            mode: this.props.mode || "list"
        },
        {
            addItemHandler: observable.ref
        }
    );

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
        const {children, canChangeMode, hideAddItemHandler, i18nPrefix = "focus"} = this.props;
        const {mode, addItemHandler} = this.childContext;
        return (
            <Theme theme={this.props.theme}>
                {theme => (
                    <div className={theme.wrapper}>
                        <div className={theme.bar}>
                            {canChangeMode ? (
                                <IconButton
                                    accent={mode === "list"}
                                    onClick={() => (this.childContext.mode = "list")}
                                    icon={getIcon(`${i18nPrefix}.icons.listWrapper.list`)}
                                    tooltip={i18next.t(`${i18nPrefix}.list.mode.list`)}
                                />
                            ) : null}
                            {canChangeMode ? (
                                <IconButton
                                    accent={mode === "mosaic"}
                                    onClick={() => (this.childContext.mode = "mosaic")}
                                    icon={getIcon(`${i18nPrefix}.icons.listWrapper.mosaic`)}
                                    tooltip={i18next.t(`${i18nPrefix}.list.mode.mosaic`)}
                                />
                            ) : null}
                            {!hideAddItemHandler && addItemHandler && mode === "list" ? (
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
        );
    }
}
