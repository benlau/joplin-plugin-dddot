async function sleep(time) {
    return new Promise((resolve) => { setTimeout(resolve, time); });
}

function onDropped(type, elem, callback) {
    $(elem).on("dragover", (event) => {
        const dt = event.originalEvent.dataTransfer;
        if (dt.types.indexOf(type) >= 0) {
            dt.dropEffect = "link";
            $(elem).addClass("dddot-note-dragging");
            return false;
        }
        return undefined;
    });

    $(elem).on("dragleave", () => {
        $(elem).removeClass("dddot-note-dragging");
    });

    $(elem).on("drop", (event) => {
        const dt = event.originalEvent.dataTransfer;
        $(elem).removeClass("dddot-note-dragging");
        if (dt.types.indexOf(type) >= 0) {
            callback(dt.getData(type));
            return false;
        }
        return undefined;
    });
}

async function waitUntilLoaded(components) {
    for (;;) {
        const loadedComponents = components.filter((component) => component in window);
        if (loadedComponents.length === components.length) {
            break;
        }
        await sleep(100);
    }
}

class DDDot {
    static X_JOP_NOTE_IDS = "text/x-jop-note-ids";

    static X_JOP_FOLDER_IDS = "text/x-jop-folder-ids";

    static panelMessageCallbacks = {};

    static eventListeners = [];

    static Event = {
        SortableDragStarted: "SortableDragStarted",
        SortableDragEnded: "SortableDragEnded",
    };

    static sortable = undefined;

    static fullSceenDialog = undefined;

    static listenPanelMessage() {
        webviewApi.onMessage((payload) => {
            const { message } = payload;
            const { type } = message;

            if (!Object.prototype.hasOwnProperty.call(this.panelMessageCallbacks, type)) {
                console.warn(`Message[${type}] is not registered`);
                return;
            }
            this.panelMessageCallbacks[type](message);
        });
    }

    static async load() {
        this.listenPanelMessage();
        this.onMessage("dddot.start", (message) => {
            this.start(message);
        });
        this.onMessage("dddot.setToolOrder", (message) => {
            this.setToolOrder(message);
        });

        this.onMessage("dddot.fullScreenDialog.open", (message) => {
            this.fullSceenDialogOpen(message);
        });

        const components = ["CodeMirror", "Sortable", "FullScreenDialog", "$", "CodeMirror5Manager"];
        await waitUntilLoaded(components);

        const container = document.getElementById("dddot-panel-container");

        const sortable = Sortable.create(container, {
            ghostClass: "dddot-sortable-ghost",
            handle: ".dddot-tool-header",
            onStart: () => {
                this.postEvent({
                    type: this.Event.SortableDragStarted,
                });
            },
            onEnd: () => {
                const toolIds = sortable.toArray();

                this.postEvent({
                    type: this.Event.SortableDragEnded,
                });

                this.postMessage({
                    type: "dddot.onToolOrderChanged",
                    toolIds,
                });
            },
        });
        this.sortable = sortable;

        this.fullSceenDialog = new FullScreenDialog();

        this.postMessage({
            type: "dddot.onLoaded",
        });
    }

    static async start(message) {
        const { tools, theme } = message;

        const codeMirror5Manager = new CodeMirror5Manager();
        codeMirror5Manager.init(theme);

        const workerFunctionNames = tools.map((tool) => tool.workerFunctionName);

        await waitUntilLoaded(workerFunctionNames);

        await Promise.all(tools.map(async (tool) => {
            const {
                workerFunctionName,
                containerId,
                contentId,
                enabled,
            } = tool;

            if (enabled) {
                await window[workerFunctionName]({ theme });
                $(`#${containerId}`).removeClass("dddot-hidden");
                const content = $(`#${contentId}`);

                const expandButton = $(`#${containerId} .dddot-expand-button`);

                expandButton.on("click", () => {
                    if (expandButton.hasClass("dddot-expand-button-active")) {
                        expandButton.removeClass("dddot-expand-button-active");
                        expandButton.addClass("dddot-expand-button-inactive");
                        content.addClass("dddot-hidden");
                    } else {
                        expandButton.removeClass("dddot-expand-button-inactive");
                        expandButton.addClass("dddot-expand-button-active");
                        content.removeClass("dddot-hidden");
                    }
                });
            } else {
                $(`#${containerId}`).addClass("dddot-hidden");
            }
        }));
    }

    static setToolOrder(message) {
        const { toolIds } = message;
        this.sortable.sort(toolIds);
    }

    static onMessage(type, callback) {
        this.panelMessageCallbacks[type] = callback;
    }

    static async postMessage(message) {
        if (typeof message === "string" || message instanceof String) {
            return webviewApi.postMessage(JSON.parse(message));
        }
        return webviewApi.postMessage(message);
    }

    static onNoteDropped(elem, callback) {
        onDropped(this.X_JOP_NOTE_IDS, elem, (data) => {
            const noteId = data.replace("[\"", "").replace("\"]", "");
            callback(noteId);
        });
    }

    static onFolderDropped(elem, callback) {
        onDropped(this.X_JOP_FOLDER_IDS, elem, (data) => {
            const folderId = data.replace("[\"", "").replace("\"]", "");
            callback(folderId);
        });
    }

    static async createNoteLink(noteId) {
        const response = await webviewApi.postMessage({
            type: "dddot.getNote",
            noteId,
        });
        const {
            note,
        } = response;
        const {
            title,
        } = note;

        return `[${title}](:/${noteId})`;
    }

    static async openNote(noteId) {
        await webviewApi.postMessage({
            type: "dddot.openNote",
            noteId,
        });
    }

    static postEvent(event) {
        this.eventListeners.forEach((listener) => {
            try {
                listener(event);
            } catch (e) {
                // ignore the error
            }
        });
    }

    static onEvent(listener) {
        this.eventListeners.push(listener);
    }

    static fullSceenDialogOpen(message) {
        const {
            title,
            html,
        } = message;
        this.fullSceenDialog.open(title, html);
    }
}
DDDot.load();
