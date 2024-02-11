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

async function waitUntilCreated(id) {
    for (;;) {
        const container = document.getElementById(id);
        if (container) {
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

        const components = ["CodeMirror", "Sortable", "$", "CodeMirror5Manager", "App"];
        await waitUntilLoaded(components);

        this.postMessage({
            type: "dddot.onLoaded",
        });
    }

    static async start(message) {
        const { tools, theme, serviceWorkerFunctions } = message;
        App.render("dddot-app", tools);

        await waitUntilCreated("dddot-panel-container");

        const codeMirror5Manager = new CodeMirror5Manager();
        codeMirror5Manager.init(theme);

        const workerFunctionNames = tools.map((tool) => tool.workerFunctionName);

        await waitUntilLoaded(workerFunctionNames);

        await Promise.all(tools.map(async (tool) => {
            const {
                workerFunctionName,
                containerId,
                enabled,
            } = tool;

            if (enabled) {
                await window[workerFunctionName]({ theme });
                $(`#${containerId}`).removeClass("dddot-hidden");
            } else {
                $(`#${containerId}`).addClass("dddot-hidden");
            }
        }));

        await waitUntilLoaded(serviceWorkerFunctions);

        await Promise.all(serviceWorkerFunctions.map(async (serviceWorkerFunction) => {
            await window[serviceWorkerFunction]({ theme });
        }));
    }

    static setToolOrder(message) {
        const { toolIds } = message;
        App.setToolsOrder(toolIds);
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

    static setupDraggableLinks(selector) {
        // eslint-disable-next-line
        $(selector).on("dragstart", function (event) {
            const id = $(this).attr("dddot-note-id");
            event.originalEvent.dataTransfer.clearData();
            event.originalEvent.dataTransfer.setData(DDDot.X_JOP_NOTE_IDS, `["${id}"]`);
        });
    }
}
DDDot.load();
