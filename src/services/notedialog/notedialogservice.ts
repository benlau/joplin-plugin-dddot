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

    render(options) {
        const {
            title,
            body,
            noteId,
        } = options;

        const titleLink = this.renderTitle(noteId, title);
        const tools = [
            ["swap", t("notedialog.swap"), t("notedialog.swap_tooltip")],
        ];

        const toolHtml = tools.map(([command, label, tooltip]) => this.renderButton(command, label, tooltip, "top-right")).join("\n");

        const commands = [
            ["append-selected-text",
                t("notedialog.cut_append_selected_text"),
                t("notedialog.cut_append_selected_text_tooltip")],
            ["append-note-link",
                t("notedialog.append_note_link"),
                t("notedialog.append_note_link_tooltip")],
        ];

        const commandHtml = commands.map(([command, label, tooltip]) => this.renderButton(command, label, tooltip, "top-lefft")).join("\n");

        const html = `<div>
<div class="dddot-notedialog-container">
  <div class="dddot-notedialog-header">
      <div class="dddot-notedialog-title">${titleLink}</div>
      <div class="dddot-notedialog-close-button-holder ">
        <div class="dddot-notedialog-close-button dddot-clickable">
            <h3><i class="fas fa-times"></i></h3>
        </div>
      </div>
  </div>
  <div class="dddot-notedialog-content">
    <div class="dddot-notedialog-editor">
        <div class="dddot-notedialog-editor-content">
            <textarea id="dddot-notedialog-texarea" rows="10">${body}</textarea>
        </div>
    </div>
    <div class="dddot-notedialog-tool-panel">
        ${toolHtml}
    </div>
    <div class="dddot-note-dialog-command-panel">
        <div class="dddot-note-dialog-command-panel-content">
            <h3>${t("notedialog.note_editor")} ⮕ ${t("notedialog.quick_view")}</h3>
            ${commandHtml}
        </div>
    </div>
  </div>
</div>`;
        return html;
    }

    renderTitle(noteId, title) {
        const {
            rendererService,
        } = this;

        const escapedTitle = rendererService.escapeInline(title);
        const openLink = {
            type: "dddot.openNote",
            noteId,
        };
        const js = `onClick="${rendererService.renderInlineDDDotPostMessage(openLink)}; return false;"`;

        return `
        <div draggable="true" 
             class="dddot-text-decoration-none dddot-note-dialog-title" 
             dddot-note-id="${noteId}" dddot-note-title="${escapedTitle}" ${js}>
            <div>
                <h3 class="dddot-note-dialog-title-text">
                    <a href="#">${title}</a>
                </h3>
            </div>
        </div>        
        `;
    }

    renderButton(
        command: string,
        title: string,
        tooltip: string,
        alignment = "",
    ) {
        const position = alignment !== "" ? `tooltip-${alignment}` : "";

        return `
        <div>
            <div class="tooltip-multiline ${position} dddot-notedialog-button" data-tooltip="${tooltip}">
                <button class="dddot-clickable" command="${command}">${title}</button>
            </div>
        </div>
`;
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
            html: this.render({ title, body, noteId }),
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
