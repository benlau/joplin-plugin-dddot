import joplin from "api";
import { ToolbarButtonLocation } from "api/types";
import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import Panel from "./panel";

joplin.plugins.register({
    async onStart() {
        const locale = await joplin.settings.globalValue("locale");

        i18next
            .use(resourcesToBackend((language, namespace, callback) => {
                import(`./locales/${language}.json`)
                    .then((resources) => {
                        callback(null, resources);
                    })
                    .catch((error) => {
                        callback(error, null);
                    });
            }))
            .init({
                lng: locale,
                debug: true,
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
