import joplin from "api";
import { ToolbarButtonLocation } from "api/types";
import Panel from "./panel";
import { initializeI18N } from "./i18n";

joplin.plugins.register({
    async onStart() {
        const locale = await joplin.settings.globalValue("locale");

        initializeI18N(locale);

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
