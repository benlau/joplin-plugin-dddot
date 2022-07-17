// eslint-disable-next-line
async function toolbarWorker() {

    const refresh = (content) => {
        $("#dddot-toolbar-container").html(content);
    };

    const response = await DDDot.postMessage({ type: "toolbar.service.onReady" });
    refresh(response);
}
