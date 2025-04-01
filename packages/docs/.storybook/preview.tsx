import "@focus4/collections/lib/focus4.collections.css";
import "@focus4/form-toolbox/lib/focus4.form-toolbox.css";
import "@focus4/forms/lib/focus4.forms.css";
import "@focus4/layout/lib/focus4.layout.css";
import "@focus4/styling/lib/focus4.styling.css";
import "@focus4/toolbox/lib/focus4.toolbox.css";
import "./preview.css";

import {i18nCollections} from "@focus4/collections";
import {i18nFormToolbox} from "@focus4/form-toolbox";
import {i18nLayout} from "@focus4/layout";
import {i18nStores} from "@focus4/stores";

import {colorScheme, initColorScheme, initI18n} from "@focus4/core";

import {Controls, Description, Primary, Subtitle, Title} from "@storybook/blocks";
import {addons} from "@storybook/preview-api";
import type {Preview} from "@storybook/react";
import i18next from "i18next";
import React from "react";
import {initReactI18next} from "react-i18next";
import {DARK_MODE_EVENT_NAME} from "storybook-dark-mode";

import {CssVariables} from "./custom/CssVariables";
import {DocsContainer} from "./custom/DocsContainer";

const channel = addons.getChannel();
channel.on(DARK_MODE_EVENT_NAME, v => (colorScheme.dark = v));
initColorScheme(true);

initI18n([initReactI18next], "fr", [i18nCollections, i18nFormToolbox, i18nLayout, i18nStores], {
    fr: {
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
});

console.log(i18next);

export default {
    initialGlobals: {
        locale: "fr",
        locales: {
            fr: "Français",
            en: "English"
        }
    },
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
        i18n: i18next,
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
                    "CSS"
                ]
            }
        }
    }
} satisfies Preview;
