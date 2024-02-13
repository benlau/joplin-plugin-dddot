import LinkGraphNode from "src/services/linkgraph/linkgraphnode";
import { t } from "i18next";
import Tool, { blockDisabled } from "../tool";

export default class BackLinks extends Tool {
    selectedNoteId = "";

    get title() {
        return t("backlinks.title");
    }

    get key() {
        return "backlinks";
    }

    async start() {
        this.servicePool.linkGraphService.onNodeUpdated((node) => {
            if (node.id === this.selectedNoteId) {
                this.refresh(node);
            }
        });

        await this.joplinRepo.workspaceOnNoteSelectionChange(() => {
            this.onNoteSelectionChanged();
        });
    }

    async onMessage(message: any) {
        switch (message.type) {
        case "backlinks.onReady":
            this.query();
            break;
        case "backlinks.tool.openNoteDetailDialog":
            this.openNoteDetailDialog(message.noteId);
            break;
        default:
            break;
        }
    }

    async query() {
        if (this.selectedNoteId === "") {
            return;
        }
        const node = this.servicePool.linkGraphService.queryBacklinks(this.selectedNoteId);
        if (node !== undefined) {
            await this.refresh(node);
        }
    }

    @blockDisabled
    async onNoteSelectionChanged() {
        const activeNote = await this.joplinRepo.workspaceSelectedNote();
        this.selectedNoteId = activeNote.id;
        await this.query();
    }

    @blockDisabled
    async refresh(node: LinkGraphNode) {
        const links = node.backlinks.map((link) => ({
            id: link.id,
            title: link.title,
            type: link.type,
            isTodo: link.isTodo,
            isTodoCompleted: link.isTodoCompleted,
        }));

        const message = {
            type: "backlinks.refresh",
            links,
        };

        this.joplinRepo.panelPostMessage(message);
    }

    async openNoteDetailDialog(noteId: string) {
        const {
            noteDialogService,
        } = this.servicePool;

        await noteDialogService.open(noteId);
    }
}
