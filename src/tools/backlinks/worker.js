// eslint-disable-next-line
async function backlinksWorker() {
    const contentId = "#dddot-backlinks-tool-content";

    const refresh = (content) => {
        App.setSectionViewProp("backlinks", "html", content);
        DDDot.setupDraggableLinks(`${contentId} .dddot-note-item`);
    };

    DDDot.onMessage("backlinks.refresh", (message) => {
        refresh(message.html);
    });

    const response = await DDDot.postMessage({
        type: "backlinks.onReady",
    });
    refresh(response);
}
