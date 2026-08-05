import {cleanup} from "@testing-library/react";
import i18next from "i18next";
import {initReactI18next} from "react-i18next";
import {afterAll, afterEach, beforeAll, vi} from "vitest";

/** Initialise i18next une seule fois, puis ajoute les traductions supplémentaires si nécessaire. */
export async function initI18n(translations: Record<string, string> = {}): Promise<void> {
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
export function setupComponentTest(translations: Record<string, string> = {}): void {
    beforeAll(async () => {
        await initI18n(translations);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    afterAll(() => {
        document.body.innerHTML = "";
    });
}
