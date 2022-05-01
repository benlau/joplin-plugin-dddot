import { MenuItemLocation } from "api/types";
import Tool from "../tool";

export default class TextSorter extends Tool {
    get hasView() {
        return false;
    }

    get isDefaultEnabled() {
        return false;
    }

    async registerCommands() {
        const command = "dddot.textsorter.sortselected";
        await this.joplinRepo.commandsRegister({
            name: command,
            label: "Sort text...",
            iconName: "fas",
            execute: async () => this.sortSelectedText(),
        });

        await this.joplinRepo.menuItemsCreate("sortSelectedTextMenu", command, MenuItemLocation.EditorContextMenu);
    }

    async sortSelectedText() {
        const selectedText = (await this.joplinRepo.commandsExecute("selectedText") as string);

        const lines = selectedText.split("\n");
        lines.sort();
        await this.joplinRepo.commandsExecute("replaceSelection", lines.join("\n"));
    }

    async onMessage(_: any) {
        return undefined;
    }

    get title() {
        return "Sort Text";
    }

    get key() {
        return "textsorter";
    }
}
