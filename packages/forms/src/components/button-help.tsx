import i18next from "i18next";

import {getIcon} from "@focus4/styling";
import {IconButton, tooltipFactory} from "@focus4/toolbox";

const Button = tooltipFactory()(IconButton);

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
