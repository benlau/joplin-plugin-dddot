// eslint-disable-next-line
async function recentnotesWorker() {
    const contentId = "#dddot-recentnotes-tool-content";

    const refresh = (content) => {
        $(contentId).html(content);

        // eslint-disable-next-line
        $(`${contentId} .dddot-note-item`).on("dragstart", function (event) {
            const id = $(this).attr("dddot-note-id");
            event.originalEvent.dataTransfer.clearData();
            event.originalEvent.dataTransfer.setData(DDDot.X_JOP_NOTE_IDS, `["${id}"]`);
        });
    };

    DDDot.onMessage("recentnotes.refresh", (message) => {
        refresh(message.html);
    });

    const response = await DDDot.postMessage({
        type: "recentnotes.onReady",
    });
    refresh(response);
}
