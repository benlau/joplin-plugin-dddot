import joplin from "api";
import { ToolbarButtonLocation } from "api/types";
import Panel from "./panel";

joplin.plugins.register({
    async onStart() {
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
