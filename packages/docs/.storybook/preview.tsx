import "@focus4/collections/lib/focus4.collections.css";
import "@focus4/forms/lib/focus4.forms.css";
import "@focus4/styling/lib/focus4.styling.css";
import "@focus4/toolbox/lib/focus4.toolbox.css";
import "./preview.css";

import {translation as collections} from "@focus4/collections";
import {translation as forms} from "@focus4/forms";
import {colorScheme, initColorScheme} from "@focus4/styling";
import {DocsContainer as BaseContainer} from "@storybook/blocks";
import type {Preview} from "@storybook/react";
import {addons} from "@storybook/preview-api";
import i18next from "i18next";
import React from "react";
import {DARK_MODE_EVENT_NAME, useDarkMode} from "storybook-dark-mode";

import {darkTheme, lightTheme} from "./themes";

const channel = addons.getChannel();
channel.on(DARK_MODE_EVENT_NAME, v => (colorScheme.dark = v));
initColorScheme(true);

i18next.init({
    lng: "fr",
    resources: {
        fr: {translation: {focus: {...collections.fr, ...forms.fr, icons: {...collections.icons, ...forms.icons}}}}
    },
    nsSeparator: "🤷‍♂️"
});

function DocsContainer(props) {
    const dark = useDarkMode();
    return <BaseContainer {...props} theme={dark ? darkTheme : lightTheme} />;
}

export default {
    parameters: {
        controls: {
            sort: "alpha"
        },
        docs: {
            container: DocsContainer
        },
        options: {
            storySort: {
                order: [
                    "Présentation",
                    "Les bases",
                    "Modèle métier",
                    "Composants",
                    ["Composants de base", "@focus4∕toolbox", "@focus4∕forms"],
                    "Routage",
                    "Mise en page",
                    "Listes et recherche",
                    "CSS",
                    "Autres modules"
                ]
            }
        }
    }
} satisfies Preview;
