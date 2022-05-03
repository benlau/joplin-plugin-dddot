import joplin from "api";
import { ToolbarButtonLocation } from "api/types";
import i18next from "i18next";
import Panel from "./panel";
import en from "./locale-data/en.js";
import zhTW from "./locale-data/zh_TW.js";
import fr from "./locale-data/fr_FR.js";

joplin.plugins.register({
    async onStart() {
        const locale = await joplin.settings.globalValue("locale");

        i18next.init({
            lng: locale,
            debug: true,
            resources: {
                en: {
                    translation: en,
                },
                zh_TW: {
                    translation: zhTW,
                },
                fr_FR: {
                    translation: fr,
                },
            },
            fallbackLng: "en",
        });

        const panel = new Panel();

        const toggleDDDotVisibility = "dddot.toggleVisibility";

        await joplin.commands.register({
            name: toggleDDDotVisibility,
            label: "Joplin DDDot",
            iconName: "fas fa-braille",
            execute: async () => {
                await panel.toggleVisibility();
            },
        });

        await panel.start();

        await joplin.views.toolbarButtons.create("joplinDDDotToggleVisibilityButton", toggleDDDotVisibility, ToolbarButtonLocation.NoteToolbar);
    },
});
