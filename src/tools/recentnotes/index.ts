import { SettingItemType } from "api/types";
import { t } from "i18next";
import Tool from "../tool";
import LinkListModel from "../../models/linklistmodel";
import { ItemChangeEventType } from "../../repo/joplinrepo";
import { LinkMonad } from "../../types/link";

const RecentNotesContentSetting = "dddot.settings.recentnotes.content";
const RecentNotesMaxNotesSetting = "dddot.settings.recentnotes.maxnotes";
const RecentNotesMaxNotesSettingDefaultValue = 5;

export default class RecentNotes extends Tool {
    linkListModel: LinkListModel = new LinkListModel();

    settings(section: string) {
        return {
            [RecentNotesContentSetting]: {
                value: [],
                type: SettingItemType.Object,
                public: false,
                label: "Recent Notes",
                section,
            },
            [RecentNotesMaxNotesSetting]: {
                value: RecentNotesMaxNotesSettingDefaultValue,
                type: SettingItemType.Int,
                public: true,
                label: "Recent Notes - Max number of notes",
                section,
            },
        };
    }

    async start() {
        this.linkListModel.rehydrate(await this.joplinRepo.settingsLoad(
            RecentNotesContentSetting,
            [],
        ));

        await this.joplinRepo.workspaceOnNoteSelectionChange(async () => {
            const activeNote = await this.joplinRepo.workspaceSelectedNote();
            await this.insertLink(activeNote);
        });

        await this.joplinRepo.workspaceOnNoteChange(async (change) => {
            const { id, event } = change;
            if (event === ItemChangeEventType.Update) {
                const note = await this.joplinService.getNote(id);
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
        await this.joplinRepo.settingsSave(
            RecentNotesContentSetting,
            this.linkListModel.dehydrate(),
        );
    }

    async refresh() {
        const links = this.read();
        const message = {
            type: "recentnotes.refresh",
            links,
        };

        this.joplinRepo.panelPostMessage(message);
        return links;
    }

    read() {
        return this.linkListModel.links.map((link) => ({
            id: link.id,
            title: link.title,
            type: link.type,
            isTodo: link.isTodo,
            isTodoCompleted: link.isTodoCompleted,
        }));
    }

    async insertLink(note) {
        const prependLink = LinkMonad.createNoteLinkFromRawData(note);

        this.linkListModel.unshift(prependLink);

        await this.truncate();
        await this.save();
        await this.refresh();
    }

    async onMessage(message: any) {
        switch (message.type) {
        case "recentnotes.onReady":
            return this.onReady();
        case "recentnotes.tool.openNoteDetailDialog":
            return this.openNoteDetailDialog(message.noteId);
        default:
            break;
        }
        return undefined;
    }

    async openNoteDetailDialog(noteId: string) {
        const {
            noteDialogService,
        } = this.servicePool;

        await noteDialogService.open(noteId);
    }

    get title() {
        return t("recentnotes.title");
    }

    async onReady() {
        await this.truncate();
        return this.read();
    }

    async truncate() {
        const maxVisibleItemCount = await this.joplinRepo.settingsLoad(
            RecentNotesMaxNotesSetting,
            RecentNotesMaxNotesSettingDefaultValue,
        );
        this.linkListModel.links = this.linkListModel.links.slice(0, maxVisibleItemCount);
    }

    get key() {
        return "recentnotes";
    }
}
