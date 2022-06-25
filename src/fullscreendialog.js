// eslint-disable-next-line
class FullScreenDialog {
    open(title, html) {
        const template = `
<div class="dddot-fullscreen-dialog-container">
  <div class="dddot-fullscreen-dialog-header">
      <div class="dddot-fullscreen-dialog-title">${title}</div>
      <div class="dddot-fullscreen-dialog-close-button-holder">
          <div class="dddot-fullscreen-dialog-close-button dddot-no-text-decoration">X</div>
      </div>
  </div>
  <div class="dddot-fullscreen-dialog-content">
      ${html}
  </div>
</div>
    `;
        const div = $(template);
        $(document.body).append(div);
        const closeButton = $(".dddot-fullscreen-dialog-close-button");
        closeButton.on("click", () => {
            this.close();
        });
    }

    close() {
        $(".dddot-fullscreen-dialog-container").remove();
    }
}
