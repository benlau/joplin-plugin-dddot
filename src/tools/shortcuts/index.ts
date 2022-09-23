import { SettingItemType } from "api/types";
import { t } from "i18next";
import Tool from "../tool";
import LinkListModel from "../../models/linklistmodel";
import { ItemChangeEventType } from "../../repo/joplinrepo";
import JoplinService from "../../services/joplin/joplinservice";
import { LinkType } from "../../types/link";

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
        this.linkListModel.rehydrate(await this.joplinRepo.settingsLoad(ShortcutsContent, []));

        await this.joplinRepo.workspaceOnNoteChange(async (change) => {
            const { id, event } = change;
            if (event === ItemChangeEventType.Update) {
                const note = await this.joplinService.getNote(id);
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
        case "shortcuts.tool.removeLink":
            this.removeLink(message.id);
            return undefined;
        case "shortcuts.onOrderChanged":
            await this.onOrderChanged(message.noteIds);
            break;
        case "shortcuts.tool.pushFolder":
            return this.pushFolder(message.folderId);
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
            return `<div class='dddot-tool-help-text'>${t("shortcuts.drag_note_here")}</div>`;
        }
        const list = links.map((link: any) => {
            const options = (link.type === LinkType.NoteLink) ? {
                onClick: {
                    type: "dddot.openNote",
                    noteId: link.id,
                },
                onContextMenu: {
                    type: "shortcuts.tool.removeLink",
                    id: link.id,
                },
                isTodo: link.isTodo,
                isTodoCompleted: link.isTodoCompleted,
            } : {
                onClick: {
                    type: "panel.openFolder",
                    folderId: link.id,
                },
                onContextMenu: {
                    type: "shortcuts.tool.removeLink",
                    id: link.id,
                },
                isTodo: false,
                isTodoCompleted: false,
            };

            return rendererService.renderNoteLink(link.id, link.title, options);
        });
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

    async removeLink(id: string) {
        const result = await this.joplinService.showMessageBox("Are you sure to remove this shortcut?");
        if (result === JoplinService.Cancel) {
            return;
        }

        this.linkListModel.remove(id);
        await this.save();
        this.refresh(this.render());
    }

    async pushFolder(folderId: string) {
        const link = await this.joplinService.createFolderLink(folderId);
        this.linkListModel.push(link);
        await this.save();

        return this.render();
    }

    async onOrderChanged(noteIds: string[]) {
        this.linkListModel.reorder(noteIds);
        await this.save();
    }

    async save() {
        await this.joplinRepo.settingsSave(ShortcutsContent, this.linkListModel.dehydrate());
    }

    get key() {
        return "shortcuts";
    }

    get title() {
        return t("shortcuts.title");
    }
}
