// eslint-disable-next-line
async function scratchpadWorker() {
    const contentId = "#dddot-scratchpad-tool-content";
    const cm = null;

    const refresh = async (content, height) => {
        App.setSectionViewProp("scratchpad", "content", content);
        App.setSectionViewProp("scratchpad", "height", height);
    };

    DDDot.onMessage("scratchpad.worker.toggleFocus", (_) => {
        if (!cm.hasFocus()) {
            cm.focus();
        } else {
            DDDot.postMessage({
                type: "dddot.focusNoteBody",
            });
        }
    });

    const { content, height } = await DDDot.postMessage({
        type: "scratchpad.onReady",
    });
    refresh(content, height);
}
