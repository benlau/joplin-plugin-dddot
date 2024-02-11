// eslint-disable-next-line
async function recentnotesWorker() {
    const contentId = "#dddot-recentnotes-tool-content";

    const refresh = (content) => {
        App.setSectionViewProp("recentnotes", "html", content);

        DDDot.setupDraggableLinks(`${contentId} .dddot-note-item`);
    };

    DDDot.onMessage("recentnotes.refresh", (message) => {
        refresh(message.html);
    });

    const response = await DDDot.postMessage({
        type: "recentnotes.onReady",
    });
    refresh(response);
}
