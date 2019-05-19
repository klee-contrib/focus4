import i18next from "i18next";
import * as React from "react";
import {IconButton} from "react-toolbox/lib/button";
import Tooltip from "react-toolbox/lib/tooltip";

import {getIcon} from "./icon";

const Button = Tooltip(IconButton);

/** Affiche un bouton pour ouvrir le centre d'aide. */
export function ButtonHelp({blockName, i18nPrefix = "focus"}: {blockName: string; i18nPrefix?: string}) {
    const {hash, pathname} = window.location;
    const url = (hash && hash.replace("#", "")) || pathname;
    const {openHelpCenter} = window as any;

    if (typeof openHelpCenter !== "function") {
        console.warn(
            `La fonction "window.openHelpCenter" n'est pas définie. Merci de placer quelque part dans l'application une "DraggableIframe" avec "openHelpCenter" comme "toggleFunctionName"`
        );
    }

    return (
        <Button
            onClick={() => openHelpCenter(url, blockName)}
            icon={getIcon(`${i18nPrefix}.icons.button.help`)}
            tooltip={`${i18next.t(`${i18nPrefix}.components.button.help`)} : ${blockName}`}
        />
    );
}
