// eslint-disable-next-line
async function toolbarWorker() {

    const refresh = (toolbarItems) => {
        App.setSectionViewProp("toolbar", "toolbarItems", toolbarItems);
    };

    const toolbarItems = await DDDot.postMessage({ type: "toolbar.service.onReady" });
    refresh(toolbarItems);
}
