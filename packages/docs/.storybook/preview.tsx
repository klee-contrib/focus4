import "@focus4/styling/lib/focus4.styling.css";
import "@focus4/toolbox/lib/focus4.toolbox.css";
import "./preview.css";

import {colorScheme, initColorScheme} from "@focus4/styling";
import {DocsContainer as BaseContainer} from "@storybook/blocks";
import type {Preview} from "@storybook/react";
import {addons} from "@storybook/preview-api";
import React from "react";
import {DARK_MODE_EVENT_NAME, useDarkMode} from "storybook-dark-mode";

import {darkTheme, lightTheme} from "./themes";

const channel = addons.getChannel();
channel.on(DARK_MODE_EVENT_NAME, v => (colorScheme.dark = v));
initColorScheme(true);

function DocsContainer(props) {
    const dark = useDarkMode();
    return <BaseContainer {...props} theme={dark ? darkTheme : lightTheme} />;
}

export default {
    parameters: {
        actions: {argTypesRegex: "^on[A-Z].*"},
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            },
            sort: "requiredFirst"
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
