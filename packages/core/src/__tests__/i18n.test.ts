import {i18n} from "i18next";
import {DateTime} from "luxon";
import {describe, expect, test, vi} from "vitest";

import {addValueFormatters, baseI18nextConfig} from "../i18n";

interface TranslationView {
    focus?: {
        hello?: string;
        bye?: string;
        boolean?: string;
        date?: string;
        datetime?: string;
        icons?: {save?: string; delete?: string};
    };
    custom?: {title?: string};
}

const asTranslationView = (value: unknown) => value as TranslationView;

describe("i18n utils", () => {
    test("baseI18nextConfig fusionne les traductions focus et custom", () => {
        const config = baseI18nextConfig(
            [
                {
                    fr: {hello: "bonjour"},
                    en: {hello: "hello"},
                    icons: {save: "Sauvegarder"}
                },
                {
                    fr: {bye: "au revoir"},
                    icons: {delete: "Supprimer"}
                }
            ],
            {
                fr: {custom: {title: "Titre"}},
                de: {custom: {title: "Titel"}}
            }
        );

        expect(config.react?.useSuspense).toBe(false);
        expect(config.supportedLngs).toEqual(expect.arrayContaining(["fr", "en", "de"]));
        const frTranslation = asTranslationView(config.resources?.fr?.translation);
        const deTranslation = asTranslationView(config.resources?.de?.translation);

        expect(frTranslation.focus?.hello).toBe("bonjour");
        expect(frTranslation.focus?.bye).toBe("au revoir");
        expect(frTranslation.focus?.boolean).toBe("{{value, boolean}}");
        expect(frTranslation.focus?.date).toBe("{{-value, date}}");
        expect(frTranslation.focus?.datetime).toBe("{{-value, datetime}}");
        expect(frTranslation.focus?.icons).toEqual({save: "Sauvegarder", delete: "Supprimer"});
        expect(frTranslation.custom).toEqual({title: "Titre"});
        expect(deTranslation.custom).toEqual({title: "Titel"});
    });

    test("addValueFormatters enregistre les 3 formateurs et gère les valeurs vides", () => {
        const registered = new Map<string, (value: unknown, lng?: string) => string>();
        const i18nextMock = {
            t: vi.fn((key: string) => `tr:${key}`),
            services: {
                formatter: {
                    add: vi.fn((name: string, formatter: (value: unknown, lng?: string) => string) => {
                        registered.set(name, formatter);
                    })
                }
            }
        };

        addValueFormatters(i18nextMock as unknown as i18n);

        expect(i18nextMock.services.formatter.add).toHaveBeenCalledTimes(3);
        expect(registered.get("boolean")?.(true)).toBe("tr:focus.bool.true");
        expect(registered.get("boolean")?.("false")).toBe("tr:focus.bool.false");
        expect(registered.get("boolean")?.("x")).toBe("");
        expect(registered.get("date")?.("", "fr")).toBe("");
        expect(registered.get("datetime")?.(undefined, "fr")).toBe("");
    });

    test("formatteurs date et datetime utilisent luxon avec la locale", () => {
        const registered = new Map<string, (value: unknown, lng?: string) => string>();
        const i18nextMock = {
            t: vi.fn(),
            services: {
                formatter: {
                    add: vi.fn((name: string, formatter: (value: unknown, lng?: string) => string) => {
                        registered.set(name, formatter);
                    })
                }
            }
        };

        addValueFormatters(i18nextMock as unknown as i18n);

        expect(registered.get("date")?.("2020-01-02", "fr")).toBe(
            DateTime.fromISO("2020-01-02").setLocale("fr").toLocaleString(DateTime.DATE_SHORT)
        );
        expect(registered.get("datetime")?.("2020-01-02T03:04:05", "en")).toBe(
            DateTime.fromISO("2020-01-02T03:04:05").setLocale("en").toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
        );
    });
});
