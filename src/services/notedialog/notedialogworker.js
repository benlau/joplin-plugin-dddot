// eslint-disable-next-line
async function noteDialogWorker() {

    const closeDialog = () => {
        App.setNoteDialogVisible(false);
    };

    const openDialog = (noteId, html) => {
        App.setNoteDialogVisible(true);
    };

    DDDot.onMessage("notedialog.worker.open", (message) => {
        const {
            noteId,
            title,
            content,
        } = message;
        App.setSectionViewProp("notedialog", "noteId", noteId);
        App.setSectionViewProp("notedialog", "title", title);
        App.setSectionViewProp("notedialog", "content", content);
        closeDialog();
        openDialog();
    });

    DDDot.onMessage("notedialog.worker.refresh", (message) => {
        const {
            content,
        } = message;
        App.setSectionViewProp("notedialog", "content", content);

        currentEditor.setValue(content);
        const lastLine = currentEditor.lastLine();
        const rect = currentEditor.charCoords({ line: lastLine, ch: 0 });
        const height = rect.bottom;
        currentEditor.scrollTo(null, height);
    });
}
