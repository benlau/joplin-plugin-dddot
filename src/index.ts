import joplin from "api";
import { ToolbarButtonLocation } from "api/types";
import * as i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import Panel from "./panel";
import en from "./locales/en.json";
// eslint-disable-next-line camelcase
import zh_TW from "./locales/zh_TW.json";
// eslint-disable-next-line camelcase
import fr_FR from "./locales/fr_FR.json";

const locales = {
    en,
    // eslint-disable-next-line camelcase
    zh_TW,
    // eslint-disable-next-line camelcase
    fr_FR,
};

joplin.plugins.register({
    async onStart() {
        const locale = await joplin.settings.globalValue("locale");

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

        const panel = new Panel();

        const command = "dddot.cmd.toggleDDDot";

        await joplin.commands.register({
            name: command,
            label: "Toggle DDDot Visibility",
            iconName: "fas fa-braille",
            execute: async () => {
                await panel.toggleVisibility();
            },
        });

        await panel.start();

        await joplin.views.toolbarButtons.create("joplinDDDotToggleVisibilityButton", command, ToolbarButtonLocation.NoteToolbar);
    },
});
