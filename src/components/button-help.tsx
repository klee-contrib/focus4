import i18n from "i18next";
import * as React from "react";
import {IconButton} from "react-toolbox/lib/button";
import Tooltip from "react-toolbox/lib/tooltip";

const Button = Tooltip(IconButton);

export function ButtonHelp({blockName}: {blockName: string}) {
    const {hash, pathname} = window.location;
    const url = hash && hash.replace("#", "") || pathname;
    const {openHelpCenter} = window as any;

    if (typeof openHelpCenter !== "function") {
        console.warn("You forgot to set the function \"window.openHelpCenter\". Please mount somewhere in your application a \"DraggableIframe\" with \"openHelpCenter\" as the \"toggleFunctionName\" prop");
    }

    return (
        <Button
            onClick={() => openHelpCenter(url, blockName)}
            icon="help_outline"
            tooltip={`${i18n.t("focus.components.button.help")} : ${blockName}`}
        />
    );
}

export default ButtonHelp;
