import {cleanup, render, RenderOptions, RenderResult} from "@testing-library/react";
import i18next from "i18next";
import {ReactElement} from "react";
import {initReactI18next} from "react-i18next";
import {afterEach, beforeAll, vi} from "vitest";

import {ThemeProvider} from "@focus4/styling";

/** Initialise i18next une seule fois, puis ajoute les traductions supplémentaires si nécessaire. */
export async function initI18n(translations: Record<string, unknown> = {}): Promise<void> {
    if (!i18next.isInitialized) {
        await i18next.use(initReactI18next).init({
            lng: "fr",
            resources: {fr: {translation: translations}}
        });
    } else if (Object.keys(translations).length) {
        i18next.addResourceBundle("fr", "translation", translations, true, true);
    }
}

/** Installe les hooks standards pour un test de composant : init i18n, cleanup RTL, reset du DOM. */
export function setupComponentTest(translations: Record<string, unknown> = {}): void {
    beforeAll(async () => {
        await initI18n(translations);
    });

    afterEach(() => {
        cleanup();
        document.body.innerHTML = "";
        vi.restoreAllMocks();
    });
}

/** Thème global à injecter via un `ThemeProvider` pour couvrir tous les sous-composants Focus utilisés en test. */
export const defaultAppTheme = {
    button: {button: "btn", icon: "btn-icon", label: "btn-label", spinner: "btn-spinner"},
    checkbox: {
        check: "cb-check",
        checkbox: "cb",
        input: "cb-input",
        label: "cb-label",
        outline: "cb-outline",
        state: "cb-state"
    },
    chip: {chip: "chip", delete: "chip-delete", icon: "chip-icon", label: "chip-label"},
    iconButton: {button: "ib", icon: "ib-icon", spinner: "ib-spinner"},
    radio: {dot: "rb-dot", input: "rb-input", label: "rb-label", outline: "rb-outline", radio: "rb", state: "rb-state"},
    supportingText: {supportingText: "st"},
    switch: {
        icon: "sw-icon",
        input: "sw-input",
        label: "sw-label",
        state: "sw-state",
        switch: "sw",
        thumb: "sw-thumb",
        track: "sw-track"
    },
    textField: {
        field: "tf-field",
        icon: "tf-icon",
        input: "tf-input",
        inputContainer: "tf-inputContainer",
        label: "tf-label",
        outline: "tf-outline",
        prefix: "tf-prefix",
        progress: "tf-progress",
        suffix: "tf-suffix",
        supportingText: "tf-supportingText",
        textField: "tf",
        tooltip: "tf-tooltip",
        trailingButton: "tf-trailingButton"
    },
    tooltip: {content: "tt-content", tooltip: "tt"}
};

/** Rend un composant enveloppé dans un `ThemeProvider` fournissant des classes pour tous les composants Focus. */
export function renderWithTheme(ui: ReactElement, options?: RenderOptions): RenderResult {
    return render(<ThemeProvider appTheme={defaultAppTheme}>{ui}</ThemeProvider>, options);
}
