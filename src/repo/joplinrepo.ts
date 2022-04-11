import joplin from "api";

export enum ItemChangeEventType {
    Create = 1,
    Update = 2,
    Delete = 3
}

export default class JoplinRepo {
    panelView: string;

    constructor(panelView = "") {
        this.panelView = panelView;
    }

    async settingsSave(key: string, value: any) {
        return joplin.settings.setValue(key, value);
    }

    async settingsLoad(key: string, defaults: any) {
        return await joplin.settings.value(key) ?? defaults;
    }

    async dataGet(path: any, query?: any) {
        return joplin.data.get(path, query);
    }

    async getNote(noteId: string) {
        return joplin.data.get(["notes", noteId]);
    }

    async workspaceSelectedNote() {
        return joplin.workspace.selectedNote();
    }

    async workspaceOnNoteChange(listener) {
        return joplin.workspace.onNoteChange(listener);
    }

    async workspaceOnNoteSelectionChange(listener) {
        return joplin.workspace.onNoteSelectionChange(listener);
    }

    async panelPostMessage(message: any) {
        joplin.views.panels.postMessage(this.panelView, message);
    }

    async dialogShowMessageBox(message: string) {
        return joplin.views.dialogs.showMessageBox(message);
    }
}
