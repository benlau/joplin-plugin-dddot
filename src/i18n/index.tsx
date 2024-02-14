import resourcesToBackend from "i18next-resources-to-backend";
import * as i18next from "i18next";
import en from "../locales/en.json";
// eslint-disable-next-line camelcase
import zh_TW from "../locales/zh_TW.json";
// eslint-disable-next-line camelcase
import fr_FR from "../locales/fr_FR.json";

const locales = {
    en,
    // eslint-disable-next-line camelcase
    zh_TW,
    // eslint-disable-next-line camelcase
    fr_FR,
};

export function initializeI18N(locale: string) {
    i18next
        .use(resourcesToBackend((language, namespace, callback) => {
            if (locales[language] === undefined) {
                callback(new Error(`Language ${language} not supported`), null);
            } else {
                callback(null, locales[language]);
            }
        }))
        .init({
            lng: locale,
            debug: true,
            fallbackLng: "en",
        });
}
