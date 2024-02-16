async function sleep(time) {
    return new Promise((resolve) => { setTimeout(resolve, time); });
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

        const components = ["CodeMirror", "CodeMirror5Manager", "App"];
        await waitUntilLoaded(components);

        this.postMessage({
            type: "dddot.onLoaded",
        });
    }

    static async start(message) {
        const {
            tools, theme, serviceWorkerFunctions, locale,
        } = message;

        const codeMirror5Manager = new CodeMirror5Manager();
        codeMirror5Manager.init(theme);

        App.setupLocale(locale);
        App.render("dddot-app", tools);

        await waitUntilCreated("dddot-panel-container");

        const workerFunctionNames = tools.map((tool) => tool.workerFunctionName);

        await waitUntilLoaded(workerFunctionNames);

        await Promise.all(tools.map(async (tool) => {
            const {
                workerFunctionName,
                enabled,
            } = tool;

            if (enabled) {
                await window[workerFunctionName]({ theme });
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
