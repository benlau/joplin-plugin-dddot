import { SettingItemType } from "api/types";
import Tool from "../tool";
import LinkListModel from "../../models/linklistmodel";
import { ItemChangeEventType } from "../../repo/joplinrepo";
import JoplinService from "../../services/joplin/joplinservice";

const ShortcutsContent = "dddot.settings.shortcuts.content";

export default class Shortcuts extends Tool {
    linkListModel: LinkListModel = new LinkListModel();

    settings(section: string) {
        return {
            [ShortcutsContent]: {
                value: [],
                type: SettingItemType.Object,
                public: false,
                label: "Recent Notes",
                section,
            },
        };
    }

    async start() {
        this.linkListModel.links = await this.joplinRepo.settingsLoad(ShortcutsContent, []);

        await this.joplinRepo.workspaceOnNoteChange(async (change) => {
            const { id, event } = change;
            if (event === ItemChangeEventType.Update) {
                const note = await this.joplinRepo.getNote(id);
                const {
                    title,
                } = note;
                if (this.linkListModel.update(id, { title })) {
                    await this.save();
                    this.refresh(this.render());
                }
            }
        });
    }

    async onMessage(message: any) {
        switch (message.type) {
        case "shortcuts.onReady":
            return this.render();
        case "shortcuts.onNoteDropped":
            return this.pushNote(message.noteId);
        case "shortcuts.removeNote":
            this.removeNote(message.noteId);
            return undefined;
        case "shortcuts.onOrderChanged":
            await this.onOrderChanged(message.noteIds);
            break;
        default:
            break;
        }
        return undefined;
    }

    render() {
        const { links } = this.linkListModel;
        const {
            rendererService,
        } = this.servicePool;

        if (links.length === 0) {
            return "<div class='dddot-tool-help-text'>Drag a note here</div>";
        }
        const list = links.map((link: any) => rendererService.renderNoteLink(link.id, link.title, {
            onClick: {
                type: "dddot.openNote",
                noteId: link.id,
            },
            onContextMenu: {
                type: "shortcuts.removeNote",
                noteId: link.id,
            },
            isTodo: link.isTodo,
            isTodoCompleted: link.isTodoCompleted,
        }));
        const html = ["<div id='dddot-shortcuts-list' class='dddot-note-list'>", ...list, "</div>"];
        return html.join("\n");
    }

    async refresh(html: any) {
        this.joplinRepo.panelPostMessage({
            type: "shortcuts.refresh",
            html,
        });
    }

    async pushNote(noteId: string) {
        const link = await this.joplinService.createNoteLink(noteId);
        this.linkListModel.push(link);
        await this.save();

        return this.render();
    }

    async removeNote(noteId: string) {
        const result = await this.joplinService.showMessageBox("Are you sure to remove this shortcut?");
        if (result === JoplinService.Cancel) {
            return;
        }

        this.linkListModel.remove(noteId);
        await this.save();
        this.refresh(this.render());
    }

    async onOrderChanged(noteIds: string[]) {
        this.linkListModel.reorder(noteIds);
        await this.save();
    }

    async save() {
        await this.joplinRepo.settingsSave(ShortcutsContent, this.linkListModel.toData());
    }

    get key() {
        return "shortcuts";
    }

    get title() {
        return "Shortcuts";
    }
}
