import i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";
import {themr} from "react-css-themr";

import Button from "focus-components/button";

import {Popin, PopinStyle, styles} from "./popin";

export interface PopinConfirmationProps {
    cancelHandler?: () => void;
    confirmHandler: () => void;
    closePopin: () => void;
    i18nPrefix?: string;
    opened: boolean;
    theme?: PopinStyle;
}

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
