import DateTimeService from "src/services/datetime/datetimeservice";
import NoteDialogService from "src/services/notedialog/notedialogservice";
import { SettingItemType, MenuItem } from "api/types";
import { t } from "i18next";
import { format } from "fecha";
import PlatformRepo from "src/repo/platformrepo";
import Tool from "../tool";
import ToolbarService from "../../services/toolbar/toolbarservice";
import ServicePool from "../../services/servicepool";

const DailyNoteDefaultNotebook = "dddot.settings.dailynote.defaultNotebook";
const DailyNoteStartTime = "dddot.settings.dailynote.startTime";

export default class DailyNoteTool extends Tool {
    toolbarService: ToolbarService;

    dateTimeService: DateTimeService;

    noteDialogService: NoteDialogService;

    platformRepo: PlatformRepo;

    constructor(servicePool: ServicePool) {
        super(servicePool);
        this.toolbarService = servicePool.toolbarService;
        this.dateTimeService = servicePool.dateTimeService;
        this.noteDialogService = servicePool.noteDialogService;
        this.joplinRepo = servicePool.joplinRepo;
        this.platformRepo = servicePool.platformRepo;
    }

    settings(section: string) {
        const options = Array.from(Array(24).keys()).map((index) => {
            const key = `${index}`;
            const value = `${key.padStart(2, "0")}:00`;
            return { key, value };
        }).reduce((acc, cur) => { acc[cur.key] = cur.value; return acc; }, {});

        return {
            [DailyNoteDefaultNotebook]: {
                value: "",
                type: SettingItemType.String,
                public: true,
                label: "Daily Note: Default Notebook",
                section,
            },
            [DailyNoteStartTime]: {
                value: "7",
                type: SettingItemType.String,
                public: true,
                label: "Daily Note: Start time of a day",
                isEnum: true,
                options,
                section,
            },
        };
    }

    async start() {
    }

    async onLoaded() {
        this.toolbarService.addToolbarItem({
            name: "Daily Note",
            icon: "fa-calendar-alt",
            tooltip: "Open Daily Note",
            onClick: {
                type: "dailynote.service.createDailyNoteAndOpenNote",
            },
            onContextMenu: {
                type: "dailynote.service.createDailyNoteAndOpenDialog",
            },
        });
    }

    get hasView() {
        return false;
    }

    get title() {
        return "dailynote.title";
    }

    get key() {
        return "dailynote";
    }

    async onMessage(message : any) {
        const { type } = message;
        switch (type) {
        case "dailynote.service.createDailyNoteAndOpenNote":
            this.createDailyNoteAndOpenNote();
            break;
        case "dailynote.service.createDailyNoteAndOpenDialog":
            this.createDailyNoteAndOpenDialog();
            break;
        default: break;
        }
    }

    breakdownDate(date: Date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return {
            year, month, day,
        };
    }

    async genNoteId(date: Date) {
        const {
            joplinService,
        } = this;

        const { year, month, day } = this.breakdownDate(date);

        const url = `calendar://default/day/${year}/${month}/${day}`;

        return joplinService.urlToId(url);
    }

    async createDailyNoteAndOpenNote() {
        const {
            noteId,
        } = await this.getOrCreateDailyNote();

        await this.joplinService.openNoteAndWaitOpened(noteId);
    }

    async createDailyNoteAndOpenDialog() {
        const {
            noteId,
        } = await this.getOrCreateDailyNote();

        await this.noteDialogService.openAndWaitOpened(noteId);
    }

    async getOrCreateDailyNote() {
        const {
            joplinService,
            dateTimeService,
            joplinRepo,
        } = this;

        const startHour = parseInt(await joplinRepo.settingsLoad(DailyNoteStartTime, "7"), 10);

        const today = dateTimeService.getNormalizedToday(startHour);

        const hashedNoteId = await this.genNoteId(today);

        const dateFormat = await joplinRepo.settingsLoadGlobal("dateFormat", "YYYY-MM-DD");

        const title = format(today, dateFormat);

        const defaultNotebook = (await joplinRepo.settingsLoad(DailyNoteDefaultNotebook, "")).trim();

        try {
            const note = await joplinService.getNote(hashedNoteId);
            if (note) {
                return {
                    noteId: hashedNoteId,
                };
            }
        } catch {
            // Do nothing
        }

        const searchResult = await joplinService.searchNoteByTitle(title, 1);
        if (searchResult.length > 0) {
            return {
                noteId: searchResult[0].id,
            };
        }

        const parentId = defaultNotebook !== "" ? await joplinService.queryNotebookId(defaultNotebook) : await joplinService.getFirstNotebookId();

        if (!parentId) {
            await joplinRepo.toast(t("dailynote.default_notebook_not_found", { notebook: defaultNotebook }), "error");
            return {
                noteId: hashedNoteId,
            };
        }

        await joplinService.createNoteWithIdIfNotExists(hashedNoteId, title, { parentId });

        return {
            noteId: hashedNoteId,
        };
    }

    async registerCommands(): Promise<MenuItem[]> {
        const command = "dddot.cmd.openDailyNote";
        await this.joplinRepo.commandsRegister({
            name: command,
            label: t("dailynote.open_daily_note"),
            iconName: "fas",
            execute: async () => this.createDailyNoteAndOpenNote(),
        });

        return [
            {
                commandName: command,
                accelerator: this.platformRepo.isMac() ? "Cmd+O" : "Ctrl+O",
            },
        ];
    }
}
