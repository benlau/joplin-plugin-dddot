// eslint-disable-next-line
async function noteDialogWorker() {

    const closeDialog = () => {
        App.setNoteDialogVisible(false);
    };

    const openDialog = () => {
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
    });
}
