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

    render(node: LinkGraphNode) {
        const links = node.backlinks;
        const {
            rendererService,
        } = this.servicePool;

        const list = links.map((note: any) => {
            const link = rendererService.renderNoteLink(
                note.id,
                note.title,
                {
                    onClick: {
                        type: "dddot.openNote",
                        noteId: note.id,
                    },
                    isTodo: note.isTodo,
                    isTodoCompleted: note.isTodoCompleted,
                },
            );
            return link;
        });
        const html = ["<div class=dddot-note-list>", ...list, "</div>"];
        return html.join("\n");
    }

    async onMessage(message: any) {
        if (message.type === "backlinks.onReady") {
            this.query();
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
        const html = this.render(node);

        const message = {
            type: "backlinks.refresh",
            html,
        };

        this.joplinRepo.panelPostMessage(message);
    }
}
