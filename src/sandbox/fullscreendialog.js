// eslint-disable-next-line
class FullScreenDialog {
    open(title, html) {
        const template = `
<div class="dddot-fullscreen-dialog-container">
  <div class="dddot-fullscreen-dialog-header">
      <div class="dddot-fullscreen-dialog-title"><h3>${title}</h3></div>
      <div class="dddot-fullscreen-dialog-close-button-holder">
        <h3><i class="fas fa-times"></i></h3>
      </div>
  </div>
  <div class="dddot-fullscreen-dialog-content">
      ${html}
  </div>
</div>
    `;
        const div = $(template);
        $(document.body).append(div);
        const closeButton = $(".dddot-fullscreen-dialog-close-button-holder");
        closeButton.on("click", () => {
            this.close();
        });

        const textArea = $("#dddot-fullscreen-dialog-texarea")[0];
        if (textArea) {
            const cm = CodeMirror.fromTextArea(textArea, {
                mode: "markdown",
                lineWrapping: true,
                highlightFormatting: true,
                readOnly: true,
                theme: CodeMirror5Manager.instance.themeName,
            });

            const height = 100;
            const minHeight = 50;
            cm.setSize(null, `${height}px`);

            CodeMirror5Manager.instance.setupResizable(cm, height, minHeight, ".dddot-fullscreen-dialog-texarea-handle");
        }
    }

    close() {
        $(".dddot-fullscreen-dialog-container").remove();
    }
}

window.FullScreenDialog = FullScreenDialog;
