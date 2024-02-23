import { SettingItemType } from "api/types";
import { t } from "i18next";
import Tool from "../tool";
import LinkListModel from "../../models/linklistmodel";
import { ItemChangeEventType } from "../../repo/joplinrepo";
import JoplinService from "../../services/joplin/joplinservice";
import { Link } from "../../types/link";

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
                    this.refresh(this.read());
                }
            }
        });
    }

    async onMessage(message: any) {
        switch (message.type) {
        case "shortcuts.onReady":
            return this.read();
        case "shortcuts.onNoteDropped":
            return this.pushNote(message.noteId);
        case "shortcuts.tool.removeLink":
            this.removeLink(message.id);
            return undefined;
        case "shortcuts.importShortcuts":
            this.importShortcuts(message.shortcuts);
            break;
        case "shortcuts.onImportExportClicked":
            this.showOverlay();
            return undefined;
        case "shortcuts.onOrderChanged":
            await this.onOrderChanged(message.linkIds);
            break;
        case "shortcuts.tool.pushFolder":
            return this.pushFolder(message.folderId);
        default:
            break;
        }
        return undefined;
    }

    read(): Link[] {
        return this.linkListModel.links.map((link) => ({
            id: link.id,
            title: link.title,
            type: link.type,
            isTodo: link.isTodo,
            isTodoCompleted: link.isTodoCompleted,
        }));
    }

    async refresh(links: Link[]) {
        this.joplinRepo.panelPostMessage({
            type: "shortcuts.refresh",
            links,
        });
    }

    async pushNote(noteId: string) {
        const link = await this.joplinService.createNoteLink(noteId);
        this.linkListModel.push(link);
        await this.save();

        this.refresh(this.read());
    }

    async removeLink(id: string) {
        const result = await this.joplinService.showMessageBox("Are you sure to remove this shortcut?");
        if (result === JoplinService.Cancel) {
            return;
        }

        this.linkListModel.remove(id);
        await this.save();
        this.refresh(this.read());
    }

    async pushFolder(folderId: string) {
        const link = await this.joplinService.createFolderLink(folderId);
        this.linkListModel.push(link);
        await this.save();

        this.refresh(this.read());
    }

    async onOrderChanged(linkIds: string[]) {
        this.linkListModel.reorder(linkIds);
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

    get extraButtons() {
        return [
            {
                tooltip: t("shortcuts.import_export_tooltip"),
                icon: "fas fa-file-export",
                message: {
                    type: "shortcuts.onImportExportClicked",
                },
            },
        ];
    }

    showOverlay() {
        this.joplinRepo.panelPostMessage({
            type: "shortcuts.showOverlay",
        });
    }

    async importShortcuts(shortcuts: Link[]) {
        this.linkListModel.rehydrate(shortcuts);
        await this.save();
        this.refresh(this.read());
    }
}
