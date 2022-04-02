// eslint-disable-next-line
async function backlinksWorker() {
    const contentId = "#dddot-backlinks-tool-content";

    const refresh = (content) => {
        $(contentId).html(content);
        // eslint-disable-next-line
        $(`${contentId} .dddot-note-item`).on("dragstart", function (event) {
            const id = $(this).attr("dddot-note-id");
            event.originalEvent.dataTransfer.clearData();
            event.originalEvent.dataTransfer.setData(DDDot.X_JOP_NOTE_IDS, `["${id}"]`);
        });
    };

    DDDot.onMessage("backlinks.refresh", (message) => {
        refresh(message.html);
    });

    const response = await DDDot.postMessage({
        type: "backlinks.onReady",
    });
    refresh(response);
}
