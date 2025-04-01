import {merge} from "es-toolkit";
import i18next, {NewableModule, ThirdPartyModule} from "i18next";

/**
 * Utilitaire pour initialiser i18next avec les traductions Focus.
 * @param plugins Les plugins i18next à utiliser (à priori au moins `initReactI18next`).
 * @param defaultLang Langue par défaut (à priori "fr").
 * @param focusI18n Liste des traductions exportées par les modules Focus.
 * @param customI18n Objet de traduction i18n, avec une clé par langue, qui sera mergé avec les traductions Focus.
 */
export function initI18n(
    plugins: (ThirdPartyModule | NewableModule<ThirdPartyModule>)[],
    defaultLang: string,
    focusI18n: Record<string, object>[],
    customI18n: Record<string, object>
) {
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

    for (const plugin of plugins) {
        i18next.use(plugin);
    }

    i18next.init({
        lng: defaultLang,
        fallbackLng: defaultLang,
        nsSeparator: "🤷‍♂️",
        react: {useSuspense: false},
        resources,
        supportedLngs: Object.keys(resources)
    });
}
