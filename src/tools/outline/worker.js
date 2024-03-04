// eslint-disable-next-line
async function outlineWorker() {
    const refresh = (id, title, outlines) => {
        App.setSectionViewProp("outline", "id", id);
        App.setSectionViewProp("outline", "title", title);
        App.setSectionViewProp("outline", "outlines", outlines);
    };

    DDDot.onMessage("outline.refresh", (message) => {
        refresh(message.id, message.title, message.outlines);
    });

    const response = await DDDot.postMessage({
        type: "outline.onReady",
    });
    const {
        id,
        title,
        outlines,
        height,
    } = response;
    refresh(id, title, outlines);
    App.setSectionViewProp("outline", "height", height);
}
