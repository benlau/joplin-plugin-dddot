/** Wrapper of Joplin API
 *
 * Reference:
 * joplin.data
 * https://joplinapp.org/api/references/plugin_api/classes/joplindata.html
 */

import joplin from "api";
import {
    ButtonSpec, DialogResult, ViewHandle, CreateMenuItemOptions, MenuItemLocation,
    MenuItem,
} from "api/types";

export enum ItemChangeEventType {
    Create = 1,
    Update = 2,
    Delete = 3
}

export default class JoplinRepo {
    panelView: string;

    toastCounter = 0;

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

    async dataPost(path: any, query?: any, data ?: any) {
        return joplin.data.post(path, query, data);
    }

    async dataGet(path: any, query?: any) {
        return joplin.data.get(path, query);
    }

    async dataPut(path: any, query?: any, data ?: any) {
        return joplin.data.put(path, query, data);
    }

    async workspaceSelectedNote() {
        return joplin.workspace.selectedNote();
    }

    async workspaceSelectedNoteIds() {
        return joplin.workspace.selectedNoteIds();
    }

    async workspaceSelectedFolder() {
        return joplin.workspace.selectedFolder();
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

    async menusCreate(
        id: string,
        title: string,
        menuItems: MenuItem[],
    ) {
        return joplin.views.menus.create(id, title, menuItems);
    }

    async toast(
        message: string,
        type: "success" | "error" | "info" = "success",
        duration: number = 3000,
    ) {
        try {
            await (joplin.views.dialogs as any).showToast(
                {
                    message,
                    // eslint-disable-next-line no-plusplus
                    duration: duration + (this.toastCounter++ % 50),
                    type,
                },
            );
        } catch {
            // Ignore
        }
    }
}
