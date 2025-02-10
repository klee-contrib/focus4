import "@focus4/collections/lib/focus4.collections.css";
import "@focus4/form-toolbox/lib/focus4.form-toolbox.css";
import "@focus4/forms/lib/focus4.forms.css";
import "@focus4/layout/lib/focus4.layout.css";
import "@focus4/styling/lib/focus4.styling.css";
import "@focus4/toolbox/lib/focus4.toolbox.css";
import "./preview.css";

import {translation as collections} from "@focus4/collections";
import {translation as forms} from "@focus4/form-toolbox";
import {translation as layout} from "@focus4/layout";
import {translation as stores} from "@focus4/stores";
import {colorScheme, initColorScheme} from "@focus4/styling";

import {Controls, Description, Primary, Subtitle, Title} from "@storybook/blocks";
import {addons} from "@storybook/preview-api";
import type {Preview} from "@storybook/react";
import i18next from "i18next";
import React from "react";
import {DARK_MODE_EVENT_NAME} from "storybook-dark-mode";

import {CssVariables} from "./custom/CssVariables";
import {DocsContainer} from "./custom/DocsContainer";

const channel = addons.getChannel();
channel.on(DARK_MODE_EVENT_NAME, v => (colorScheme.dark = v));
initColorScheme(true);

i18next.init({
    lng: "fr",
    resources: {
        fr: {
            translation: {
                focus: {
                    ...collections.fr,
                    ...forms.fr,
                    ...stores.fr,
                    icons: {...collections.icons, ...forms.icons, ...layout.icons}
                },
                router: {
                    root: "Accueil",
                    utilisateurs: {
                        root: "Utilisateurs",
                        utiId: {
                            root: "Détail de l'utilisateur : {{param}}"
                        }
                    }
                }
            }
        }
    },
    nsSeparator: "🤷‍♂️"
});

export default {
    parameters: {
        controls: {
            sort: "alpha"
        },
        docs: {
            container: DocsContainer,
            page: () => (
                <>
                    <Title />
                    <Subtitle />
                    <Description />
                    <Primary />
                    <h3>Props</h3>
                    <Controls sort="requiredFirst" />
                    <h3>Variables CSS</h3>
                    <CssVariables />
                </>
            )
        },
        options: {
            storySort: {
                order: [
                    "Présentation",
                    "Les bases",
                    "Modèle métier",
                    "Composants",
                    ["Composants de base", "@focus4∕toolbox", "@focus4∕form-toolbox"],
                    "Listes",
                    "Routage",
                    "Mise en page",
                    [
                        "Présentation",
                        "Layout",
                        "Scrollable",
                        "HeaderScrolling",
                        "MainMenu",
                        "FilAriane",
                        "Panel",
                        "ScrollspyContainer",
                        "Popin",
                        "Dialog",
                        "LateralMenu"
                    ],
                    "CSS",
                    "Autres modules"
                ]
            }
        }
    }
} satisfies Preview;
