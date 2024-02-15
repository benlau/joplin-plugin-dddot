import { MenuItemLocation, MenuItem } from "api/types";
import { t } from "i18next";
import TimerRepo from "../../repo/timerrepo";
import JoplinService from "../joplin/joplinservice";
import RendererService from "../renderer/rendererservice";

export default class NoteDialogService {
    joplinService: JoplinService;

    rendererService: RendererService;

    timerRepo: TimerRepo;

    constructor(
        joplinService: JoplinService,
        rendererService: RendererService,
        timerRepo: TimerRepo = new TimerRepo(),
    ) {
        this.joplinService = joplinService;
        this.rendererService = rendererService;
        this.timerRepo = timerRepo;
    }

    async registerCommands(): Promise<MenuItem[]> {
        const {
            joplinRepo,
        } = this.joplinService;

        const command = "dddot.cmd.openNoteInSideBar";

        await joplinRepo.commandsRegister({
            name: command,
            label: t("notedialog.open_note_dddot"),
            iconName: "fas",
            execute: async (noteIds:string[]) => {
                if (noteIds.length === 0) {
                    return;
                }

                const noteId = noteIds[0];

                this.open(noteId);
            },
        });

        await joplinRepo.menuItemsCreate(
            `${command}:NoteListContextMenu`,
            command,
            MenuItemLocation.NoteListContextMenu,
        );

        return [];
    }

    async open(noteId: string) {
        const {
            joplinRepo,
        } = this.joplinService;
        const note = await this.joplinService.getNote(noteId, ["title", "body"]);
        const {
            title,
            body,
        } = note;

        const message = {
            type: "notedialog.worker.open",
            noteId,
            title,
            content: body,
        };

        await joplinRepo.panelPostMessage(message);
    }

    async openAndWaitOpened(noteId: string, timeout = TimerRepo.DEFAULT_TIMEOUT) {
        await this.timerRepo.tryWaitUntilTimeout(async () => {
            try {
                await this.open(noteId);
                return true;
            } catch (e) {
                return false;
            }
        }, timeout);
    }

    async onMessage(message: any) {
        const {
            type,
        } = message;

        switch (type) {
        case "notedialog.service.command":
            return this.runCommand(message);
        default:
            break;
        }
        return undefined;
    }

    async runCommand(message: any) {
        const {
            command,
        } = message;

        switch (command) {
        case "append-selected-text":
            return this.appendSelectedText(message);
        case "append-note-link":
            return this.appendNoteLink(message);
        case "swap":
            return this.swap(message);
        default:
            break;
        }
        return undefined;
    }

    async appendSelectedText(message: any) {
        const {
            noteId,
        } = message;
        const {
            joplinService,
        } = this;
        const { joplinRepo } = this.joplinService;

        const selectedText = (await joplinRepo.commandsExecute("selectedText") as string);
        if (selectedText === undefined || selectedText === "") {
            return;
        }
        await joplinRepo.commandsExecute("textCut");

        const newBody = await joplinService.appendTextToNote(noteId, `\n${selectedText}`);

        this.refresh(newBody);
    }

    async appendNoteLink(message: any) {
        const {
            noteId,
        } = message;
        const {
            joplinService,
            rendererService,
        } = this;
        const { joplinRepo } = this.joplinService;

        const activeNote = await joplinRepo.workspaceSelectedNote();
        if (activeNote === undefined) {
            return;
        }

        const noteLink = rendererService.renderInlineMarkdownLink(activeNote.id, activeNote.title);

        const newBody = await joplinService.appendTextToNote(noteId, `\n${noteLink}`);

        this.refresh(newBody);
    }

    async swap(message) {
        const {
            noteId,
        } = message;
        const {
            joplinService,
        } = this;

        const { joplinRepo } = this.joplinService;

        const activeNote = await joplinRepo.workspaceSelectedNote();

        if (activeNote === undefined || activeNote.id === noteId) {
            return;
        }

        this.open(activeNote.id);
        joplinService.openNote(noteId);
    }

    refresh(content: string) {
        const { joplinRepo } = this.joplinService;

        const message = {
            type: "notedialog.worker.refresh",
            content,
        };
        joplinRepo.panelPostMessage(message);
    }
}
