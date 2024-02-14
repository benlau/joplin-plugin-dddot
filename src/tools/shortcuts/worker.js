// eslint-disable-next-line
async function shortcutsWorker() {
    const refresh = (links) => {
        App.setSectionViewProp("shortcuts", "links", links);
    };

    DDDot.onNoteDropped("#dddot-shortcuts-tool-container", async (noteId) => {
        const response = await DDDot.postMessage({
            type: "shortcuts.onNoteDropped",
            noteId,
            index: 0,
        });
        refresh(response);
    });

    DDDot.onFolderDropped("#dddot-shortcuts-tool-container", async (folderId) => {
        const response = await DDDot.postMessage({
            type: "shortcuts.tool.pushFolder",
            folderId,
            index: 0,
        });
        refresh(response);
    });

    DDDot.onMessage("shortcuts.refresh", (message) => {
        refresh(message.links);
    });

    const response = await DDDot.postMessage({ type: "shortcuts.onReady" });
    refresh(response);
}
