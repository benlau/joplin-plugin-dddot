// eslint-disable-next-line
async function scratchpadWorker() {
    const cm = null;

    const refresh = async (content, height) => {
        App.setSectionViewProp("scratchpad", "content", content);
        App.setSectionViewProp("scratchpad", "height", height);
    };

    const { content, height } = await DDDot.postMessage({
        type: "scratchpad.onReady",
    });
    refresh(content, height);
}
