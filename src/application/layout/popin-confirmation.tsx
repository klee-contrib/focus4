import i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Button from "focus-components/button";

import {Popin, PopinStyle, styles} from "./popin";

/** Props de la popin de confirmation. */
export interface PopinConfirmationProps {
    /** Handler d'annulation, sera appelé en plus de la fermeture de la popin. */
    cancelHandler?: () => void;
    /** Handler de confirmation. */
    confirmHandler: () => void;
    /** Handler de fermeture de la popin. */
    closePopin: () => void;
    /** Par défaut : "focus" */
    i18nPrefix?: string;
    /** Popin ouverte (ou fermée). */
    opened: boolean;
    /** CSS. */
    theme?: PopinStyle;
}

/** Affiche une popin de confirmation avec des boutons de confirmation et d'annulation. */
export const PopinConfirmation = themr("popin", styles)(observer<PopinConfirmationProps>(
    ({children, closePopin, cancelHandler, confirmHandler, i18nPrefix = "focus", opened, theme}) => (
        <Popin closePopin={closePopin} opened={opened} type="center">
            {children}
            <div className={theme!.buttonStack!}>
                <Button
                    handleOnClick={() => {
                        if (cancelHandler) {
                            cancelHandler();
                        }
                        closePopin();
                    }}
                    label={i18n.t(`${i18nPrefix}.confirmation.cancel`)}
                />
                <Button
                    handleOnClick={() => {
                        confirmHandler();
                        closePopin();
                    }}
                    label={i18n.t(`${i18nPrefix}.confirmation.confirm`)}
                    color="primary"
                />
            </div>
        </Popin>
    )
));
