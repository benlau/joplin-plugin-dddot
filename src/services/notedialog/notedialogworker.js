// eslint-disable-next-line
async function noteDialogWorker() {
    let selectedHeight = 200;
    let currentEditor = null;

    const closeDialog = () => {
        $(".dddot-fullscreen-dialog-container").remove();
        currentEditor = null;
    };

    const openDialog = (noteId, html) => {
        const container = $(html);
        $(document.body).append(container);
        DDDot.setupDraggableLinks(".dddot-note-dialog-title");
        const closeButton = $(".dddot-fullscreen-dialog-close-button-holder");
        closeButton.on("click", closeDialog);
        const textArea = $("#dddot-fullscreen-dialog-texarea")[0];
        if (textArea) {
            const cm = CodeMirror.fromTextArea(textArea, {
                mode: "markdown",
                lineWrapping: true,
                highlightFormatting: true,
                readOnly: "nocursor",
                theme: CodeMirror5Manager.instance.themeName,
            });
            currentEditor = cm;

            const height = selectedHeight;
            const minHeight = 80;
            cm.setSize(null, `${height}px`);

            CodeMirror5Manager.instance.setupResizable(
                cm,
                height,
                minHeight,
                ".dddot-fullscreen-dialog-texarea-handle",
                (newHeight) => {
                    selectedHeight = newHeight;
                },
            );
        }

        $(".dddot-note-dialog-command-panel button").each((index, button) => {
            const command = $(button).attr("command");
            $(button).on("click", () => {
                DDDot.postMessage({
                    type: "notedialog.service.command",
                    command,
                    noteId,
                });
            });
        });
    };

    DDDot.onMessage("notedialog.worker.open", (message) => {
        const {
            noteId,
            html,
        } = message;
        closeDialog();
        openDialog(noteId, html);
    });

    DDDot.onMessage("notedialog.worker.refresh", (message) => {
        const {
            content,
        } = message;
        currentEditor.setValue(content);
        const lastLine = currentEditor.lastLine();
        const rect = currentEditor.charCoords({ line: lastLine, ch: 0 });
        const height = rect.bottom;
        currentEditor.scrollTo(null, height);
    });
}
