// eslint-disable-next-line
async function scratchpadWorker() {
    const contentId = "#dddot-scratchpad-tool-content";
    let cm = null;

    const refresh = async (content, height) => {
        App.setSectionViewProp("scratchpad", "html", content);

        const textArea = $("#dddot-scratchpad-textarea")[0];

        cm = CodeMirror.fromTextArea(textArea, {
            mode: "markdown",
            lineWrapping: true,
            highlightFormatting: true,
            theme: CodeMirror5Manager.instance.themeName,
        });

        cm.setSize(null, `${height}px`);
        const minHeight = 50;

        CodeMirror5Manager.instance.setupResizable(
            cm,
            height,
            minHeight,
            ".dddot-scratchpad-handle",
            (newHeight) => {
                webviewApi.postMessage({
                    type: "scratchpad.tool.setHeight",
                    height: newHeight,
                });
            },
        );

        cm.on("change", async () => {
            const value = cm.getValue();
            cm.save();
            await webviewApi.postMessage({
                type: "scratchpad.saveTextArea",
                value,
            });
        });

        cm.on("dragover", (_, event) => {
            const dt = event.dataTransfer;
            if (dt.types.indexOf(DDDot.X_JOP_NOTE_IDS) >= 0) {
                dt.dropEffect = "link";
                event.preventDefault();
            }
        });

        cm.on("drop", async (_, event) => {
            const dt = event.dataTransfer;
            if (dt.types.indexOf(DDDot.X_JOP_NOTE_IDS) >= 0) {
                const noteId = dt.getData(DDDot.X_JOP_NOTE_IDS).replace("[\"", "").replace("\"]", "");

                const text = `${await DDDot.createNoteLink(noteId)}\n`;
                const doc = cm.getDoc();

                const x = event.pageX;
                const y = event.pageY;
                cm.setCursor(cm.coordsChar({ left: x, top: y }));
                const cursor = cm.getCursor();
                doc.replaceRange(text, cursor);
            }
        });

        DDDot.onEvent((event) => {
            switch (event.type) {
            case DDDot.Event.SortableDragStarted:
                cm.setOption("dragDrop", false);
                break;
            case DDDot.Event.SortableDragEnded:
                cm.setOption("dragDrop", true);
                break;
            default:
                break;
            }
        });

        await webviewApi.postMessage({
            type: "scratchpad.loadTextArea",
        }).then((response) => {
            cm.setValue(response);
        });
    };

    DDDot.onMessage("scratchpad.worker.toggleFocus", (_) => {
        if (!cm.hasFocus()) {
            cm.focus();
        } else {
            DDDot.postMessage({
                type: "dddot.focusNoteBody",
            });
        }
    });

    const { content, height } = await DDDot.postMessage({
        type: "scratchpad.onReady",
    });
    refresh(content, height);
}
