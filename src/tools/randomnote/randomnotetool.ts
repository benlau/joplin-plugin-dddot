import NoteDialogService from "src/services/notedialog/notedialogservice";
import { MenuItem } from "api/types";
import { t } from "i18next";
import PlatformRepo from "src/repo/platformrepo";
import Tool from "../tool";
import ToolbarService from "../../services/toolbar/toolbarservice";
import ServicePool from "../../services/servicepool";

interface NoteIdCache {
    noteIds: string[];
    timestamp: number;
}

export default class RandomNoteTool extends Tool {
    toolbarService: ToolbarService;

    noteDialogService: NoteDialogService;

    platformRepo: PlatformRepo;

    private noteIdCache: NoteIdCache | null = null;

    private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

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

    private isCacheValid(): boolean {
        if (!this.noteIdCache) {
            return false;
        }

        const now = Date.now();
        return now - this.noteIdCache.timestamp < this.CACHE_DURATION_MS;
    }

    public async getNoteIds(): Promise<string[]> {
        if (this.noteIdCache == null) {
            this.noteIdCache = {
                noteIds: await this.joplinService.getAllNoteIds(),
                timestamp: Date.now(),
            };
            return this.noteIdCache.noteIds;
        }

        if (this.isCacheValid()) {
            return this.noteIdCache.noteIds;
        }
        const { noteIds } = (this.noteIdCache);

        this.joplinService.getAllNoteIds().then((refreshedNoteIds) => {
            this.noteIdCache = {
                noteIds: refreshedNoteIds,
                timestamp: Date.now(),
            };
        });
        return noteIds;
    }

    async openRandomNote() {
        try {
            const noteIds = await this.getNoteIds();

            if (noteIds.length === 0) {
                return;
            }

            const randomIndex = Math.floor(Math.random() * noteIds.length);
            const randomNoteId = noteIds[randomIndex];

            this.joplinService.openNote(randomNoteId);
        } catch (error) {
            console.error("Error opening random note:", error);
        }
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
