// eslint-disable-next-line
async function noteDialogWorker() {
    let currentEditor = null;

    const closeDialog = () => {
        $(".dddot-notedialog-container").remove();
        currentEditor = null;
    };

    const openDialog = (noteId, html) => {
        const container = $(html);
        $(document.body).append(container);

        const closeButton = $(".dddot-notedialog-close-button-holder");
        closeButton.on("click", closeDialog);
        const textArea = $("#dddot-notedialog-texarea")[0];
        if (textArea) {
            const cm = CodeMirror.fromTextArea(textArea, {
                mode: "markdown",
                lineWrapping: true,
                highlightFormatting: true,
                readOnly: true,
                theme: CodeMirror5Manager.instance.themeName,
            });
            cm.setSize(null, "100%");
            currentEditor = cm;
        }

        $(".dddot-notedialog-content button").each((index, button) => {
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
