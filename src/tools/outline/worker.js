// eslint-disable-next-line
async function outlineWorker() {
    let heightRefreshCounter = 0;

    const refresh = (id, title, outlines) => {
        App.setSectionViewProp("outline", "id", id);
        App.setSectionViewProp("outline", "title", title);
        App.setSectionViewProp("outline", "outlines", outlines);
    };

    DDDot.onMessage("outline.refresh", (message) => {
        refresh(message.id, message.title, message.outlines);
    });

    DDDot.onMessage("outline.autoResize", (message) => {
        const {
            newHeight,
        } = message;
        App.setSectionViewProp("outline", "height", newHeight);
        heightRefreshCounter += 1;
        App.setSectionViewProp("outline", "heightRefreshCounter", heightRefreshCounter);
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
