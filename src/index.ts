import joplin from "api";
import { ToolbarButtonLocation } from "api/types";
import * as i18next from "i18next";
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
