import {merge} from "es-toolkit";

/**
 * Utilitaire pour initialiser les resources i18next avec les traductions Focus.
 * @param focusI18n Liste des traductions exportées par les modules Focus.
 * @param customI18n Objet de traduction i18n, avec une clé par langue, qui sera mergé avec les traductions Focus.
 * @returns Config de base à passer à `i18next.init()`.
 */
export function baseI18nextConfig(focusI18n: Record<string, object>[], customI18n: Record<string, object>) {
    let icons = {};
    const resources: Record<string, {translation: {focus?: {icons?: object}}}> = {};

    for (const modulei18n of focusI18n) {
        for (const key in modulei18n) {
            if (key === "icons") {
                icons = {...icons, ...modulei18n[key]};
            } else {
                if (!(key in resources)) {
                    resources[key] = {translation: {focus: {}}};
                }

                resources[key].translation.focus = {...resources[key].translation.focus, ...modulei18n[key]};
            }
        }
    }

    for (const key in resources) {
        resources[key].translation.focus!.icons = icons;
    }

    for (const key in customI18n) {
        if (!(key in resources)) {
            resources[key] = {translation: {}};
        }

        merge(resources[key].translation, customI18n[key]);
    }

    return {
        nsSeparator: "🤷‍♂️",
        react: {useSuspense: false},
        resources,
        supportedLngs: Object.keys(resources)
    };
}
