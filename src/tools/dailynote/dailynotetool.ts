import DateTimeService from "src/services/datetime/datetimeservice";
import NoteDialogService from "src/services/notedialog/notedialogservice";
import { SettingItemType, MenuItemLocation } from "api/types";
import Tool from "../tool";
import ToolbarService from "../../services/toolbar/toolbarservice";
import ServicePool from "../../services/servicepool";

const DailyNoteDefaultNotebook = "dddot.settings.dailynote.defaultNotebook";

export default class DailyNoteTool extends Tool {
    toolbarService: ToolbarService;

    dateTimeService: DateTimeService;

    noteDialogService: NoteDialogService;

    constructor(servicePool: ServicePool) {
        super(servicePool);
        this.toolbarService = servicePool.toolbarService;
        this.dateTimeService = servicePool.dateTimeService;
        this.noteDialogService = servicePool.noteDialogService;
        this.joplinRepo = servicePool.joplinRepo;
    }

    settings(section: string) {
        return {
            [DailyNoteDefaultNotebook]: {
                value: "",
                type: SettingItemType.String,
                public: true,
                label: "Daily Note Default Notebook",
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
        } = await this.createDailyNote();

        await this.joplinService.openNoteAndWaitOpened(noteId);
    }

    async createDailyNoteAndOpenDialog() {
        const {
            noteId,
        } = await this.createDailyNote();

        await this.noteDialogService.openAndWaitOpened(noteId);
    }

    async createDailyNote() {
        const {
            joplinService,
            dateTimeService,
            joplinRepo,
        } = this;

        const startHour = 7; // @FIXME read from settings

        const today = dateTimeService.getNormalizedToday(startHour);
        const { year, month, day } = this.breakdownDate(today);

        const noteId = await this.genNoteId(today);

        const title = `${year}-${month}-${day}`; // @FIXME - read format from settings

        const defaultNotebook = await joplinRepo.settingsLoad(DailyNoteDefaultNotebook, "");

        const parentId = await joplinService.queryNotebookId(defaultNotebook);

        await joplinService.createNoteWithIdIfNotExists(noteId, title, { parentId });

        return {
            noteId,
        };
    }

    async registerCommands() {
        const command = "dddot.cmd.openDailyNote";
        await this.joplinRepo.commandsRegister({
            name: command,
            label: "Open Daily Note", // @FIXME Translation
            iconName: "fas",
            execute: async () => this.createDailyNoteAndOpenNote(),
        });

        await this.joplinRepo.menuItemsCreate(
            `${command}:Tools`,
            command,
            MenuItemLocation.Tools,
        );
    }
}
