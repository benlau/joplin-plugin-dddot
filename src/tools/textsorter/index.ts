import { MenuItemLocation, MenuItem } from "api/types";
import Tool from "../tool";

export default class TextSorter extends Tool {
    get hasView(): boolean {
        return false;
    }

    get hasWorkerFunction(): boolean {
        return false;
    }

    get isDefaultEnabled(): boolean {
        return false;
    }

    async registerCommands(): Promise<MenuItem[]> {
        const command = "dddot.textsorter.sortselected";
        await this.joplinRepo.commandsRegister({
            name: command,
            label: "Sort text...",
            iconName: "fas",
            execute: async () => this.sortSelectedText(),
        });

        await this.joplinRepo.menuItemsCreate("sortSelectedTextMenu", command, MenuItemLocation.EditorContextMenu);
        return [];
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
