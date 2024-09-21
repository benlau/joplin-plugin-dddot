/* eslint camelcase: "off" */
import resourcesToBackend from "i18next-resources-to-backend";
import * as i18next from "i18next";
import en from "../locales/en.json";
import zh_TW from "../locales/zh_TW.json";
import fr_FR from "../locales/fr_FR.json";
import zh_CN from "../locales/zh_CN.json";

const locales = {
    en,
    zh_TW,
    fr_FR,
    zh_CN,
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
