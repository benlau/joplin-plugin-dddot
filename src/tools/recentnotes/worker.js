// eslint-disable-next-line
async function recentnotesWorker() {
    const refresh = (links) => {
        App.setSectionViewProp("recentnotes", "links", links);
    };

    DDDot.onMessage("recentnotes.refresh", (message) => {
        refresh(message.links);
    });

    const response = await DDDot.postMessage({
        type: "recentnotes.onReady",
    });
    refresh(response);
}
