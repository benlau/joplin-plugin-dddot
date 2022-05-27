async function scratchpadResizeable(options) {
    const {
        cm,
        height,
        minHeight,
    } = options;

    let isResizing = false;
    let lastY = 0;
    let currentHeight = height;
    const handle = $(".dddot-scratchpad-handle");

    handle.on("mousedown", (e) => {
        isResizing = true;
        lastY = e.clientY;
    });

    $(document).on("mousemove", (e) => {
        if (!isResizing) { return; }

        const dy = e.clientY - lastY;
        const newHeight = currentHeight + dy;
        lastY = e.clientY;

        if (newHeight >= minHeight) {
            currentHeight = newHeight;
            cm.setSize("95%", `${currentHeight}px`);
            webviewApi.postMessage({
                type: "scratchpad.tool.setHeight",
                height: currentHeight,
            });
        } else {
            isResizing = false;
        }
    }).on("mouseup", () => {
        isResizing = false;
    });
}

// eslint-disable-next-line
async function scratchpadWorker(options) {
    const contentId = "#dddot-scratchpad-tool-content";
    const { theme } = options;

    const refresh = async (content, height) => {
        $(contentId).html(content);
        const textArea = document.getElementById("dddot-scratchpad-textarea");

        const cm = CodeMirror.fromTextArea(textArea, {
            mode: "markdown",
            lineWrapping: true,
            highlightFormatting: true,
            theme: theme.isDarkTheme ? "blackboard" : "default",
        });

        cm.setSize("95%", `${height}px`);

        scratchpadResizeable({ cm, height, minHeight: 50 });

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

    const { content, height } = await DDDot.postMessage({
        type: "scratchpad.onReady",
    });
    refresh(content, height);
}
