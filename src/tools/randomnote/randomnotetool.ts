import NoteDialogService from "src/services/notedialog/notedialogservice";
import { MenuItem } from "api/types";
import { t } from "i18next";
import PlatformRepo from "src/repo/platformrepo";
import Tool from "../tool";
import ToolbarService from "../../services/toolbar/toolbarservice";
import ServicePool from "../../services/servicepool";

export default class RandomNoteTool extends Tool {
    toolbarService: ToolbarService;

    noteDialogService: NoteDialogService;

    platformRepo: PlatformRepo;

    constructor(servicePool: ServicePool) {
        super(servicePool);
        this.toolbarService = servicePool.toolbarService;
        this.noteDialogService = servicePool.noteDialogService;
        this.joplinRepo = servicePool.joplinRepo;
        this.platformRepo = servicePool.platformRepo;
    }

    async start() {
    }

    async onLoaded() {
        this.toolbarService.addToolbarItem({
            name: "Random Note",
            icon: "fa-dice",
            tooltip: "Open Random Note",
            onClick: {
                type: "randomnote.tool.openRandomNote",
            },
            onContextMenu: {
                type: "randomnote.tool.openRandomNoteByNoteDialog",
            },
        });
    }

    get hasView() {
        return false;
    }

    get title() {
        return "randomnote.title";
    }

    get key() {
        return "randomnote";
    }

    async onMessage(message : any) {
        const { type } = message;
        switch (type) {
        case "randomnote.tool.openRandomNote":
            return this.openRandomNote();
        case "randomnote.tool.openRandomNoteByNoteDialog":
            break;
        default: break;
        }
        return undefined;
    }

    async openRandomNote() {
        const count = await this.joplinService.calcNoteCount();
        const index = Math.floor(Math.random() * count);
        await this.joplinService.openNoteByIndex(index);
    }

    async registerCommands(): Promise<MenuItem[]> {
        const command = "dddot.cmd.openRandomNote";
        await this.joplinRepo.commandsRegister({
            name: command,
            label: t("randomnote.open_random_note"),
            iconName: "fas",
            execute: async () => this.openRandomNote(),
        });

        return [{
            commandName: command,
            accelerator: this.platformRepo.isMac() ? "Cmd+R" : "Ctrl+R",
        }];
    }
}
