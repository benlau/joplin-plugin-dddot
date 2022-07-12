import JoplinService from "../joplin/joplinservice";
import RendererService from "../renderer/rendererservice";

export default class NoteDialogService {
    joplinService: JoplinService;

    rendererService: RendererService;

    constructor(joplinService: JoplinService, rendererService: RendererService) {
        this.joplinService = joplinService;
        this.rendererService = rendererService;
    }

    render(options) {
        const {
            title,
            body,
            noteId,
        } = options;

        const titleLink = this.renderTitle(noteId, title);
        const buttons = [
            ["swap", "Swap", "Swap editing note to this note"],
            ["append-selected-text", "Append selected text", "Append selected text to this note"],
            ["append-note-link", "Append note link", "Append note link to this note"],
        ];

        const buttonHtml = buttons.map(([command, label, tooltip]) => this.renderButton(command, label, tooltip)).join("\n");

        const html = `<div>
<div class="dddot-fullscreen-dialog-container">
  <div class="dddot-fullscreen-dialog-header">
      <div class="dddot-fullscreen-dialog-title">${titleLink}</div>
      <div class="dddot-fullscreen-dialog-close-button-holder dddot-clickable">
        <h3><i class="fas fa-times"></i></h3>
      </div>
  </div>
  <div class="dddot-fullscreen-dialog-content">
    <div>
      <textarea id="dddot-fullscreen-dialog-texarea" rows="10">${body}</textarea>
      <div class="fas fa-ellipsis-h dddot-fullscreen-dialog-texarea-handle"></div>
    </div>
    <div class="dddot-note-dialog-command-panel">
        ${buttonHtml}
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

    renderButton(command: string, title: string, tooltip: string) {
        return `<div class="dddot-tooltip">
            <button command="${command}">${title}</button>
            <span class="dddot-tooltiptext">${tooltip}</span>
        </div>`;
    }

    async open(noteId: string) {
        const joplinRepo = this.joplinService.repo;
        const note = await joplinRepo.getNote(noteId, ["title", "body"]);
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
        joplinRepo.panelPostMessage(message);
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
        const joplinRepo = this.joplinService.repo;

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
        const joplinRepo = this.joplinService.repo;

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

        const joplinRepo = this.joplinService.repo;

        const activeNote = await joplinRepo.workspaceSelectedNote();

        if (activeNote === undefined || activeNote.id === noteId) {
            return;
        }

        this.open(activeNote.id);
        joplinService.openNote(noteId);
    }

    refresh(content: string) {
        const joplinRepo = this.joplinService.repo;

        const message = {
            type: "notedialog.worker.refresh",
            content,
        };
        joplinRepo.panelPostMessage(message);
    }
}
