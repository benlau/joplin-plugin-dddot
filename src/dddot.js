async function sleep(time) {
    return new Promise((resolve) => { setTimeout(resolve, time); });
}

class DDDot {
    static X_JOP_NOTE_IDS = "text/x-jop-note-ids";

    static panelMessageCallbacks = {};

    static eventListeners = [];

    static Event = {
        SortableDragStarted: "SortableDragStarted",
        SortableDragEnded: "SortableDragEnded",
    };

    static sortable = undefined;

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

        let loaded = false;
        while (!loaded) {
            try {
                loaded = CodeMirror !== undefined
                         && Sortable !== undefined
                         && $ !== undefined;
            } catch (e) {
                // continue regardless of error
            }
            await sleep(100);
        }

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

        this.postMessage({
            type: "dddot.onLoaded",
        });
    }

    static async start(message) {
        const { tools } = message;
        for (;;) {
            const loadedTools = tools.filter((tool) => tool.workerFunctionName in window);
            if (loadedTools.length === tools.length) {
                break;
            }
            await sleep(100);
        }
        await Promise.all(tools.map(async (tool) => {
            const {
                workerFunctionName,
                containerId,
                enabled,
            } = tool;

            if (enabled) {
                await window[workerFunctionName]();
                $(`#${containerId}`).removeClass("dddot-hidden");
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
        $(elem).on("dragover", (event) => {
            const dt = event.originalEvent.dataTransfer;
            if (dt.types.indexOf(this.X_JOP_NOTE_IDS) >= 0) {
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
            if (dt.types.indexOf(this.X_JOP_NOTE_IDS) >= 0) {
                const noteId = dt.getData(this.X_JOP_NOTE_IDS).replace("[\"", "").replace("\"]", "");
                callback(noteId);
                return false;
            }
            return undefined;
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
}
DDDot.load();
