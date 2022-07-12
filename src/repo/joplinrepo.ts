import joplin from "api";
import {
    ButtonSpec, DialogResult, ViewHandle, CreateMenuItemOptions, MenuItemLocation,
} from "api/types";

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

    async settingsLoadGlobal(key: string, defaults: any) {
        return await joplin.settings.globalValue(key) ?? defaults;
    }

    async dataGet(path: any, query?: any) {
        return joplin.data.get(path, query);
    }

    async dataPut(path: any, query?: any, data ?: any) {
        return joplin.data.put(path, query, data);
    }

    async getNote(noteId: string, fields = undefined) {
        // @FIXME - Move this function to the joplin service
        const options : any = {};
        if (fields !== undefined) {
            options.fields = fields;
        }
        return joplin.data.get(["notes", noteId], options);
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

    async dialogCreate(id: string): Promise<ViewHandle> {
        return joplin.views.dialogs.create(id);
    }

    async dialogShowMessageBox(message: string) {
        return joplin.views.dialogs.showMessageBox(message);
    }

    async dialogSetButtons(handle: ViewHandle, buttons: ButtonSpec[]): Promise<ButtonSpec[]> {
        return joplin.views.dialogs.setButtons(handle, buttons);
    }

    async dialogSetHtml(handle: ViewHandle, html: string): Promise<string> {
        return joplin.views.dialogs.setHtml(handle, html);
    }

    async dialogOpen(handle: ViewHandle): Promise<DialogResult> {
        return joplin.views.dialogs.open(handle);
    }

    async dialogsCreate(id: string) {
        return joplin.views.dialogs.create(id);
    }

    async commandsRegister(options: any) {
        return joplin.commands.register(options);
    }

    async commandsExecute(command: string, ...args: any[]) {
        return joplin.commands.execute(command, ...args);
    }

    async menuItemsCreate(
        id: string,
        commandName: string,
        location?: MenuItemLocation,
        options?: CreateMenuItemOptions,
    ) {
        return joplin.views.menuItems.create(id, commandName, location, options);
    }
}
