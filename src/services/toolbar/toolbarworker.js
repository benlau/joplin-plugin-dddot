// eslint-disable-next-line
async function toolbarWorker() {

    const refresh = (content) => {
        if (content === undefined) {
            $("#dddot-toolbar-container").css("display", "none");
        } else {
            $("#dddot-toolbar-container").html(content);
        }
    };

    const response = await DDDot.postMessage({ type: "toolbar.service.onReady" });
    refresh(response);
}
