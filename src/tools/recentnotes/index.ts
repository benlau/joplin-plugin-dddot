import { SettingItemType } from "api/types";
import Tool from "../tool";
import LinkListModel from "../../models/linklistmodel";
import Link from "../../types/link";
import { ItemChangeEventType } from "../../repo/joplinrepo";

const RecentNotesContent = "dddot.settings.recentnotes.content";

export default class RecentNotes extends Tool {
    maxVisibleItemCount = 5;

    linkListModel: LinkListModel = new LinkListModel();

    settings(section: string) {
        return {
            [RecentNotesContent]: {
                value: [],
                type: SettingItemType.Object,
                public: false,
                label: "Recent Notes",
                section,
            },
        };
    }

    async start() {
        this.linkListModel.links = await this.joplinRepo.settingsLoad(RecentNotesContent, []);

        await this.joplinRepo.workspaceOnNoteSelectionChange(async () => {
            const activeNote = await this.joplinRepo.workspaceSelectedNote();
            await this.insertLink(activeNote);
        });

        await this.joplinRepo.workspaceOnNoteChange(async (change) => {
            const { id, event } = change;
            if (event === ItemChangeEventType.Update) {
                const note = await this.joplinRepo.getNote(id);
                const {
                    title,
                } = note;
                if (this.linkListModel.update(id, { title })) {
                    await this.save();
                    this.refresh();
                }
            }
        });
    }

    async save() {
        await this.joplinRepo.settingsSave(RecentNotesContent, this.linkListModel.toData());
    }

    async refresh() {
        const html = this.render();

        const message = {
            type: "recentnotes.refresh",
            html,
        };

        this.joplinRepo.panelPostMessage(message);
    }

    async insertLink(note) {
        const prependLink = Link.createNoteLink(note.id, note.title);

        this.linkListModel.unshift(prependLink);

        this.linkListModel.links = this.linkListModel.links.slice(0, this.maxVisibleItemCount);

        await this.save();
        await this.refresh();
    }

    async onMessage(message: any) {
        if (message.type === "recentnotes.onReady") {
            return this.render();
        }
        return undefined;
    }

    get title() {
        return "Recent Notes";
    }

    render() {
        const { links } = this.linkListModel;
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
                },
            );
            return link;
        });
        const html = ["<div class=dddot-note-list>", ...list, "</div>"];
        return html.join("\n");
    }

    get key() {
        return "recentnotes";
    }
}
